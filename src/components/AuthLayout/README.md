# AuthLayout

Split login page: gradient brand panel on the left, form on the right; stacks on phones
(benefits hidden under `lg`).

```tsx
<AuthLayout
  brand="KeenPlaza"
  subtitle="Admin console"
  headline="Run your whole store from one place"
  benefits={[{ icon: 'box', text: 'Catalog and stock' }]}
  footer={<span>Trouble signing in?</span>}
>
  <LoginForm />
</AuthLayout>
```
