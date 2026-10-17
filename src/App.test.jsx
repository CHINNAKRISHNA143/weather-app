import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the weather app", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /weather app/i })
  ).toBeInTheDocument();
});

test("shows the New Relic test control only when explicitly enabled", () => {
  window.history.replaceState({}, "", "/?newRelicTest=1");
  const { unmount } = render(<App />);

  expect(
    screen.getByRole("button", {
      name: /trigger new relic source-map test error/i,
    })
  ).toBeInTheDocument();

  unmount();
  window.history.replaceState({}, "", "/");
  render(<App />);

  expect(
    screen.queryByRole("button", {
      name: /trigger new relic source-map test error/i,
    })
  ).not.toBeInTheDocument();
});
