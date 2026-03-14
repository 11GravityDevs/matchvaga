import { describe, expect, it } from "vitest";
import {
  matchSkillsBySimilarity,
  normalizeTerm,
  SIMILARITY_THRESHOLD,
} from "./skills-match";

describe("normalizeTerm", () => {
  it("lowercases and trims", () => {
    expect(normalizeTerm("  React  ")).toBe("react");
  });

  it("collapses multiple spaces", () => {
    expect(normalizeTerm("trabalho   em   equipe")).toBe("trabalho em equipe");
  });

  it("strips accents", () => {
    expect(normalizeTerm("Comunicação")).toBe("comunicacao");
  });
});

describe("matchSkillsBySimilarity", () => {
  it("returns exact matches with original strings", () => {
    const job = ["NET.", "TypeScript"];
    const resume = [".NET", "TypeScript"];
    const result = matchSkillsBySimilarity(job, resume);
    expect(result).toEqual([
      { job_term: "NET.", resume_term: ".NET" },
      { job_term: "TypeScript", resume_term: "TypeScript" },
    ]);
  });

  it("matches after normalization (case and accents)", () => {
    const job = ["REACT", "Comunicação"];
    const resume = ["react", "comunicacao"];
    const result = matchSkillsBySimilarity(job, resume);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ job_term: "REACT", resume_term: "react" });
    expect(result[1]).toEqual({
      job_term: "Comunicação",
      resume_term: "comunicacao",
    });
  });

  it("matches by token overlap when job tokens are contained in resume term", () => {
    const job = ["trabalho em equipe"];
    const resume = ["trabalho em equipe e sob pressão"];
    const result = matchSkillsBySimilarity(job, resume);
    expect(result).toEqual([
      {
        job_term: "trabalho em equipe",
        resume_term: "trabalho em equipe e sob pressão",
      },
    ]);
  });

  it("matches by similarity when above threshold (typo)", () => {
    const job = ["JavaScript"];
    const resume = ["Javascript"];
    const result = matchSkillsBySimilarity(job, resume);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].job_term).toBe("JavaScript");
    expect(result[0].resume_term).toBe("Javascript");
  });

  it("rejects when similarity is below threshold", () => {
    const job = ["Python"];
    const resume = ["Java"];
    const result = matchSkillsBySimilarity(job, resume);
    expect(result).toEqual([]);
  });

  it("returns no false positives for unrelated terms", () => {
    const job = ["Machine Learning", "AWS"];
    const resume = ["Excel", "PowerPoint"];
    const result = matchSkillsBySimilarity(job, resume);
    expect(result).toEqual([]);
  });

  it("one job term maps to at most one resume term", () => {
    const job = ["React"];
    const resume = ["React", "React.js", "React Native"];
    const result = matchSkillsBySimilarity(job, resume);
    expect(result).toHaveLength(1);
    expect(result[0].job_term).toBe("React");
  });

  it("exports SIMILARITY_THRESHOLD for tuning", () => {
    expect(SIMILARITY_THRESHOLD).toBeGreaterThanOrEqual(0);
    expect(SIMILARITY_THRESHOLD).toBeLessThanOrEqual(1);
  });
});
