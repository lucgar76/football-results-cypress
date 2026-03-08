// src/types/results.ts

/**
 * Represents a football team
 */
export interface Team {
  name: string;
  shortName?: string;
  logo?: string;
}

/**
 * Represents the score of a match
 */
export interface MatchScore {
  home: number;
  away: number;
  fullTime?: {
    home: number;
    away: number;
  };
  halfTime?: {
    home: number;
    away: number;
  };
}

/**
 * Match status (scheduled, live, finished, postponed, cancelled)
 */
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

/**
 * Represents a single football match result
 */
export interface MatchResult {
  id: string;
  date: Date | string;
  homeTeam: Team;
  awayTeam: Team;
  score: MatchScore;
  status: MatchStatus;
  competition?: string;
  round?: string;
  venue?: string;
  referee?: string;
  attendance?: number;
}

/**
 * Raw scraped data structure from a website
 * This represents the data as it comes directly from scraping
 */
export interface ScrapedMatchData {
  // Raw HTML or parsed data fields
  rawData?: string;
  
  // Basic match information
  matchId?: string;
  date?: string;
  time?: string;
  
  // Team information (as scraped)
  homeTeamName?: string;
  homeTeamShort?: string;
  awayTeamName?: string;
  awayTeamShort?: string;
  
  // Score information (as scraped - might be strings)
  homeScore?: string | number;
  awayScore?: string | number;
  homeScoreHT?: string | number; // Half-time score
  awayScoreHT?: string | number;
  
  // Status and metadata
  status?: string;
  competition?: string;
  round?: string;
  venue?: string;
  
  // Additional scraped metadata
  [key: string]: unknown; // Allow for additional fields that might be scraped
}

/**
 * Collection of match results
 */
export interface MatchResultsCollection {
  matches: MatchResult[];
  totalCount: number;
  dateRange?: {
    start: Date | string;
    end: Date | string;
  };
  source?: string;
  scrapedAt?: Date | string;
}

/**
 * Scraping metadata and results
 */
export interface ScrapedData {
  rawMatches: ScrapedMatchData[];
  scrapedAt: Date | string;
  source: string;
  url?: string;
  success: boolean;
  error?: string;
  metadata?: {
    totalFound?: number;
    pageNumber?: number;
    hasMore?: boolean;
    [key: string]: unknown;
  };
}
