import { describe, expect, it } from "@jest/globals";
import { tags, tagsToInvalidate } from "@/lib/cache-tags";

describe("tags", () => {
  it("são separadas por usuário", () => {
    expect(tags.projects("u1")).toBe("projects:u1");
    expect(tags.extras("u1")).toBe("extras:u1");
    expect(tags.monthly("u1")).toBe("monthly:u1");
    expect(tags.projects("u1")).not.toBe(tags.projects("u2"));
  });
});

describe("tagsToInvalidate", () => {
  it("escrita de projeto invalida só projects", () => {
    expect(tagsToInvalidate("project", "u1")).toEqual(["projects:u1"]);
  });

  it("escrita de extra invalida extras, monthly e projects (total_profit)", () => {
    expect(tagsToInvalidate("extra", "u1").sort()).toEqual(
      ["extras:u1", "monthly:u1", "projects:u1"].sort(),
    );
  });

  it("recálculo invalida o mesmo que uma escrita de extra", () => {
    expect(tagsToInvalidate("recalculate", "u1").sort()).toEqual(
      tagsToInvalidate("extra", "u1").sort(),
    );
  });

  it("só invalida tags do usuário informado", () => {
    for (const write of ["project", "extra", "recalculate"] as const) {
      for (const tag of tagsToInvalidate(write, "u1")) {
        expect(tag.endsWith(":u1")).toBe(true);
      }
    }
  });
});
