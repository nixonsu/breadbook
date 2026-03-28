# Financee

Bookkeeping app for the financially disorganised.

## Setup

1. Use specified node version
```zsh
nvm use
```

2. Install dependencies

```zsh
yarn
```

3. Install playwright chromium

```zsh
npx playwright install --with-deps chromium 
```


## Run


```zsh
yarn dev
```

Available on [http://localhost:3000](http://localhost:3000)

## Database commands

**Run migrations**

```zsh
npx prisma migrate dev --name <migration name>
```

**Generate prisma models for development**

```zsh
cd prisma
npx prisma generate
```
