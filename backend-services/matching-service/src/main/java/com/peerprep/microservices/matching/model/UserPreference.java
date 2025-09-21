package com.peerprep.microservices.matching.model;

import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(value = "userPreference")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class UserPreference {
  @Id
  private String userId; // shouldnt this be user name
  private Set<String> topics; // e.g. {"DP", "Graph"}
  private Set<String> difficulties; // e.g. {"Easy", "Medium"}
  private int minTime; // e.g. 15 minutes
  private int maxTime; // e.g. 30 minutes
}