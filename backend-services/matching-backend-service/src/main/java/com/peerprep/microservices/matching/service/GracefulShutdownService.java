package com.peerprep.microservices.matching.service;

import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class GracefulShutdownService {

  private final MatchingService matchingService;
  private final AcceptanceService acceptanceService;

  private volatile boolean shuttingDown = false;

  @PreDestroy
  public void shutdown() {
    if (shuttingDown)
      return;

    shuttingDown = true;
    log.info("Starting graceful shutdown. No new requests will be accepted.");

    try {
      // Define the overall timeout window (matches EC2 termination grace period)
      Duration totalTimeout = Duration.ofSeconds(120);

      // Start monitoring both services concurrently
      CompletableFuture<Void> matchingFuture = CompletableFuture.runAsync(
          () -> matchingService.awaitTermination(totalTimeout));

      CompletableFuture<Void> acceptanceFuture = CompletableFuture.runAsync(
          () -> acceptanceService.awaitTermination(totalTimeout));

      // Wait for both services to complete or timeout
      CompletableFuture.allOf(matchingFuture, acceptanceFuture)
          .orTimeout(totalTimeout.toSeconds(), TimeUnit.SECONDS)
          .join();

      log.info("Graceful shutdown completed successfully. All pending operations resolved.");

    } catch (Exception e) {
      log.error(" Error during graceful shutdown", e);
    }
  }

  public boolean isShuttingDown() {
    return shuttingDown;
  }
}
