package com.peerprep.microservices.matching.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

import org.springframework.stereotype.Service;

import com.peerprep.microservices.matching.dto.UserPreferenceRequest;
import com.peerprep.microservices.matching.dto.UserPreferenceResponse;
import com.peerprep.microservices.matching.exception.ExistingPendingMatchRequestException;
import com.peerprep.microservices.matching.exception.NoPendingMatchRequestException;
import com.peerprep.microservices.matching.exception.UserPreferenceNotFoundException;
import com.peerprep.microservices.matching.model.UserPreference;
import com.peerprep.microservices.matching.repository.MatchingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

  private final MatchingRepository userPreferenceRepository;

  /** Thread-safe pool for users waiting to be matched */
  private final List<UserPreference> matchingPool = new ArrayList<>();

  /** Map to store waiting CompletableFutures for long-polling */
  private final Map<String, CompletableFuture<UserPreferenceResponse>> waitingFutures = new HashMap<>();

  // ---------- [User Preference] ----------
  /**
   * Update an existing user preference, or create a new one if it does not exist.
   *
   * @param userId  The ID of the user.
   * @param request The {@link UserPreferenceRequest} containing preference data.
   * @return {@link UserPreferenceResponse} representing the saved or updated preference.
   */
  public UserPreferenceResponse upsertUserPreference(UserPreferenceRequest request) {

    UserPreference userPreference = toUserPreference(request);
    
    userPreferenceRepository.save(userPreference);
    log.info("User preference updated for userId: {}", userPreference.getUserId());

    return toResponse(userPreference);
  }
  
  /**
   * Delete a user's preference and remove them from the matching pool.
   *
   * @param userId The ID of the user to delete.
   * @throws UserPreferenceNotFoundException if no preference exists for the user.
   */
  public void deleteUserPreference(String userId) {
    if (!userPreferenceRepository.existsById(userId)) {
        throw new UserPreferenceNotFoundException(userId);
    }

    // Delete from repository
    userPreferenceRepository.deleteById(userId);
    log.info("User preference deleted for userId: {}", userId);

    // Remove from matching pool and any waiting futures
    synchronized (matchingPool) {
        matchingPool.removeIf(p -> p.getUserId().equals(userId));
        CompletableFuture<UserPreferenceResponse> future = waitingFutures.remove(userId);
        if (future != null && !future.isDone()) {
            future.complete(null); 
        }
    }
  }

  /**
   * Retrieve a user's preference by their userId.
   *
   * @param userId The ID of the user.
   * @return {@link UserPreferenceResponse} for the user.
   * @throws UserPreferenceNotFoundException if no preference exists for the user.
   */
  public UserPreferenceResponse getUserPreference(String userId) {
      return userPreferenceRepository.findById(userId)
              .map(this::toResponse)
              .orElseThrow(() -> new UserPreferenceNotFoundException(userId));
  }
  
  // ---------- [Matching] ----------
  /**
   * Attempt to find a match for a user asynchronously within a given time frame.
   * 
   * If a match exists in the pool, the method completes immediately.
   * Otherwise, the user is added to the pool and wait until a compatible match is found or timeout expires.
   * 
   * @param request The {@link UserPreferenceRequest} of the user requesting a match.
   * @param timeoutMs Maximum time in milliseconds to wait for a match.
   * @return {@link CompletableFuture} that completes with a {@link UserPreferenceResponse}
   *          if a match is found, or {@code null} if the request times out.
   * @throws ExistingPendingMatchRequestException if the user already has a pending match request.
   */
  public CompletableFuture<UserPreferenceResponse> requestMatchAsync(UserPreferenceRequest request, long timeoutMs) {
    
    
    CompletableFuture<UserPreferenceResponse> future = new CompletableFuture<>();
    UserPreference userPreference = toUserPreference(request);
    String userId = userPreference.getUserId();

    synchronized (matchingPool) {

      if (waitingFutures.containsKey(userId) || matchingPool.stream().anyMatch(p -> p.getUserId().equals(userId))) {
        throw new ExistingPendingMatchRequestException(userId);
      }

      // Check if a match already exists in the pool
      Optional<UserPreference> match = findMatchFor(userPreference);
      if (match.isPresent()) {
        UserPreference matchedUser = match.get();
        matchingPool.remove(matchedUser);

        // Complete both futures if the other user is already waiting
        CompletableFuture<UserPreferenceResponse> otherFuture = waitingFutures.remove(matchedUser.getUserId());
        if (otherFuture != null) {
          otherFuture.complete(toResponse(userPreference));
        }
        future.complete(toResponse(matchedUser));

        return future;
      }

      // No match yet, add requester to pool and waiting map
      matchingPool.add(userPreference);
      waitingFutures.put(userId, future);
    }

    // Schedule timeout
    CompletableFuture.delayedExecutor(timeoutMs, java.util.concurrent.TimeUnit.MILLISECONDS)
            .execute(() -> {
                synchronized (matchingPool) {
                    if (!future.isDone()) {
                        matchingPool.removeIf(p -> p.getUserId().equals(userId));
                        waitingFutures.remove(userId);
                        future.complete(null); // timeout
                    }
                }
            });
       
    return future;
  }

  /**
   * Cancel a pending match request for a given user.
   * 
   * Removes the user from the matching pool and notifies other waiting threads
   * in case they were waiting for this user to become available.
   *
   * @param userId The ID of the user canceling their match request.
   * @throws NoPendingMatchRequestException if no pending request exists
   */
  public void cancelMatchRequest(String userId) {
    synchronized (matchingPool) {
        boolean removed = matchingPool.removeIf(p -> p.getUserId().equals(userId));
        if (!removed) {
          throw new NoPendingMatchRequestException(userId);
        }

        // Remove and complete any pending future
        CompletableFuture<UserPreferenceResponse> future = waitingFutures.remove(userId);
        if (future != null && !future.isDone()) {
            future.complete(null); // signal cancellation
        }

        log.info("User {} canceled their match request", userId);
    }
  }

  // ---------- [Helper] ----------
  
  private UserPreference toUserPreference(UserPreferenceRequest userPref) {

    // [TBD] Null defaults
    return UserPreference.builder()
                .userId(userPref.userId())
                .topics(Set.copyOf(userPref.topics()))
                .difficulties(Set.copyOf(userPref.difficulties()))
                .minTime(userPref.minTime())
                .maxTime(userPref.maxTime())
                .build();
  }

  private boolean rangesOverlap(int min1, int max1, int min2, int max2) {
    return min1 <= max2 && min2 <= max1;
  }

  private boolean overlaps(Set<String> a, Set<String> b) {
    return a != null && b != null && a.stream().anyMatch(b::contains);
  }

  private UserPreferenceResponse toResponse(UserPreference userPreference) {
    return new UserPreferenceResponse(
        userPreference.getUserId(),
        userPreference.getTopics(),
        userPreference.getDifficulties(),
        userPreference.getMinTime(),
        userPreference.getMaxTime());
  }

  private Optional<UserPreference> findMatchFor(UserPreference userPreference) {
      String userId = userPreference.getUserId();
      return matchingPool.stream()
              .filter(p -> !p.getUserId().equals(userId))
              .filter(p -> overlaps(p.getTopics(), userPreference.getTopics()))
              .filter(p -> overlaps(p.getDifficulties(), userPreference.getDifficulties()))
              .filter(p -> rangesOverlap(p.getMinTime(), p.getMaxTime(),
                      userPreference.getMinTime(), userPreference.getMaxTime()))
              .findFirst();
  }
}
