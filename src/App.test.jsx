import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

test("renders the weather app", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /weather app/i })
  ).toBeInTheDocument();
});

test("submits one explicit test error to New Relic when enabled", () => {
  window.history.pushState({}, "", "/?newRelicTest=1");
  window.newrelic = { noticeError: vi.fn() };

  render(<App />);
  fireEvent.click(
    screen.getByRole("button", { name: /send one test error to new relic/i })
  );

  expect(window.newrelic.noticeError).toHaveBeenCalledTimes(1);
  expect(window.newrelic.noticeError).toHaveBeenCalledWith(
    expect.objectContaining({
      message: "Weather app New Relic test error",
    }),
    { testError: true }
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "Test error submitted to New Relic."
  );
  expect(
    screen.getByRole("button", { name: /test error submitted/i })
  ).toBeDisabled();

  delete window.newrelic;
  window.history.pushState({}, "", "/");
});
