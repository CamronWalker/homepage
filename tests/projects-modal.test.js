// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { openProject, closeProject } from "../src/ui/projects-modal.js";

beforeEach(() => {
  document.body.innerHTML = '<div id="modalRoot"></div><button id="opener">o</button>';
  document.body.style.overflow = "";
});

it("opens with project content and locks scroll", () => {
  openProject("nauvoo-vc");
  expect(document.querySelector(".pmodal")).toBeTruthy();
  expect(document.querySelector(".pmodal h3").textContent).toMatch(/Nauvoo/);
  expect(document.body.style.overflow).toBe("hidden");
});
it("closes on Escape and restores scroll", () => {
  openProject("toronto");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  closeProject.flushForTests();
  expect(document.querySelector(".pmodal")).toBeFalsy();
  expect(document.body.style.overflow).toBe("");
});
it("unknown slug is a no-op", () => {
  openProject("nope");
  expect(document.querySelector(".pmodal")).toBeFalsy();
});
it("renders highlights and coverage links", () => {
  openProject("st-george");
  expect(document.querySelector(".pmodal .pm-highlights li")).toBeTruthy();
  expect(document.querySelector(".pmodal .pm-links a")).toBeTruthy();
});
