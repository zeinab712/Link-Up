# LinkUp — Lightweight Social Media App

Frontend built with **React + Vite + TypeScript**, styled using **Tailwind CSS**, powered by **@tanstack/react-query** for fetching/caching, and **Sera UI** for reusable components. Integrates with an external API (Tarmmeez Academy) for auth, posts, and comments.

---

## ✨ Features

* 🔐 **Auth**: Login/Register with token stored in `localStorage`.
* 📝 **Posts**: Infinite scroll, create new posts with image upload & validation.
* 💬 **Comments**: View/add comments, cache updates automatically.
* 🎨 **UI**: Responsive header, fallback avatars, mobile menu overlay.
* ⚡ **Stack**: React + Vite + TS + Tailwind + React Query + shadcn/ui.

---

## 📂 Project Structure

```
src/
  components/
    Header.tsx
    Posts.tsx
    CreatePost.tsx
    CommentForm.tsx
    Form.tsx
  lib/
  App.tsx
  main.tsx
```

Routes:

* `/home` → posts feed
* `/create-post` → new post
* `/sign-in` → login/register

---

## 🔌 API (Base URL)

```
https://tarmeezacademy.com/api/v1
```

Endpoints:

* Auth: `POST /login`, `POST /register`
* Posts: `GET /posts`, `POST /posts`
* Comments: `POST /posts/:id/comments`

---

## 🚀 Setup

### Requirements

* Node.js ≥ 18

### Commands

```bash
# install
yarn install
# dev
yarn dev
# build
yarn build
# preview
yarn preview
```

---

## ✅ Highlights

* Type-safe forms with Zod.
* Image validation (size ≤ 2MB, type image/\*).
* Optimistic updates with React Query.
* LocalStorage for session persistence.
* Clean, responsive UI with Tailwind + shadcn.

---

## 🌐 Deployment

* Works on Netlify.
* https://chipper-monstera-b994ab.netlify.app/

---
