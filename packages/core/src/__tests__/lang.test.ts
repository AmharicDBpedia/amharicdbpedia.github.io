import { describe, expect, it } from "vitest";
import { pickLocalized } from "../index";

describe("pickLocalized", () => {
  it("falls back to English for untranslated Amharic strings", () => {
    expect(
      pickLocalized(
        {
          en: "Ontology alignment",
          am: "Ontology alignment",
          de: "Ontologie-Abgleich",
        },
        "am",
      ),
    ).toBe("Ontology alignment");
  });

  it("keeps real Amharic strings", () => {
    expect(
      pickLocalized(
        {
          en: "News",
          am: "ዜና",
          de: "Aktuelles",
        },
        "am",
      ),
    ).toBe("ዜና");
  });
});
