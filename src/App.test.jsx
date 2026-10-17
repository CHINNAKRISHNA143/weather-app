import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the weather app", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /weather app/i })
  ).toBeInTheDocument();
});
