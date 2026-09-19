# ErrorBoundary

Keeps one crashing section from blanking the page. Wrap each independent card or screen.

```tsx
<ErrorBoundary fallback={(err, reset) => <ErrorState message={err.message} onRetry={reset} />}>
  <RevenueChart />
</ErrorBoundary>
```
