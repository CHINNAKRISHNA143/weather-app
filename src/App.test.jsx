import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

test("renders the weather app", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /weather app/i })
  ).toBeInTheDocument();
});

test("shows and reports one test error when requested", () => {
  window.newrelic = { noticeError: vi.fn() };

  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /generate test error/i }));

  expect(window.newrelic.noticeError).toHaveBeenCalledTimes(1);
  expect(window.newrelic.noticeError).toHaveBeenCalledWith(
    expect.objectContaining({
      message: "Weather app New Relic test error",
    }),
    { testError: true }
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Test error: Weather app New Relic test error"
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "Test error sent to New Relic."
  );
  expect(
    screen.getByRole("button", { name: /test error generated/i })
  ).toBeDisabled();

  delete window.newrelic;
});
