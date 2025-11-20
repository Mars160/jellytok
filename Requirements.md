# Product Requirements Document (PRD): Jellyfin TikTok-Style Player

## 1. Introduction

### 1.1 Project Background

This project aims to develop a web-based media player frontend utilizing Jellyfin as the backend media server. The core interaction design mimics the immersive experience of TikTok, allowing users to switch between videos via vertical swipe gestures. It is designed to provide a modern, lightweight media consumption method, particularly suitable for browsing music videos, home videos, or randomly previewing movies.

### 1.2 Tech Stack

- **Core Framework:** React
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Recommended) or Styled Components
- **Icon Library:** Lucide React or FontAwesome
- **Gesture Library:** React-Use-Gesture or Swiper.js (Vertical mode)
- **Player Core:** HTML5 Video API or HLS.js (Depending on transcoding needs)

---

## 2. User Flow

### 2.1 First Entry / Unauthenticated State

1. User opens the application.
2. System checks LocalStorage/IndexedDB for a valid API Token and Server URL.
3. If not found, automatically redirect to the **Settings/Login Page**.

### 2.2 Settings & Configuration Flow

- **Server Connection:** User enters the Jellyfin Server URL.
- **Authentication:** User enters Username and Password, then clicks Login.
  - On success: Retrieve AccessToken and UserId and store them locally.
- **Library Selection:**
  - Fetch all Views (Libraries) accessible to the current user.
  - User selects one target library (e.g., Movies, Music Videos).
- **Filter Configuration:**
  - Play Status: All / Unplayed Only / Played Only
  - Favorite Status: All / Favorites Only / Non-Favorites Only
  - Sorting: Shuffle / Date Descending / Date Ascending
- **Save & Start:** Save configurations and navigate to the **Home Player Page**.

### 2.3 Home Browsing Flow

- Fetch video list based on configuration.
- Enter full-screen immersive playback interface.
- **Swipe Up** → next video; **Swipe Down** → previous video.
- User actions: Like, Seek, Pause, etc.
- Provide clear entry (e.g., gear icon) to return to Settings.

---

## 3. Functional Requirements

### 3.1 Settings Page

This page serves as the entry point and configuration hub.

| ID   | Feature       | Detailed Description                                                       |
| ---- | ------------- | -------------------------------------------------------------------------- |
| S-01 | Server Config | Input field: Server URL; validate format.                                  |
| S-02 | User Login    | Username + Password; Login button; calls Jellyfin AuthenticateByName.      |
| S-03 | Library Load  | After login, fetch `/Users/{UserId}/Views` and show as list for selection. |
| S-04 | Video Filters | Toggles for IsPlayed and IsFavorite.                                       |
| S-05 | Persistence   | Save URL, Token, UserId, Library ID, Filters in local storage.             |
| S-06 | Reset/Logout  | Button to clear local storage and reset.                                   |

### 3.2 Home Player

TikTok-style infinite vertical stream.

| ID   | Feature           | Detailed Description                                                        |
| ---- | ----------------- | --------------------------------------------------------------------------- |
| H-01 | Video Container   | Full-screen (100vh); object-fit contain/cover; optional blurred background. |
| H-02 | Vertical Scroll   | Swipe Up/Down; auto snap.                                                   |
| H-03 | Auto-Play         | Auto play when visible; pause/destroy when out of view.                     |
| H-04 | Playback Controls | Single tap: play/pause; double tap: like/unlike (with animation).           |
| H-05 | Progress Bar      | Bottom bar; supports seeking; shows current/total time.                     |
| H-06 | Favorite Feature  | Heart icon; Solid → Favorited; Hollow → Not; calls Jellyfin API.            |
| H-07 | Metadata Overlay  | Bottom-left: Title, Year, Series Name.                                      |
| H-08 | Pagination        | Pre-load next page (infinite query).                                        |
| H-09 | Nav to Settings   | Floating or top overlay button.                                             |

---

## 4. UI Specifications

### 4.1 Layout Style

- **Theme:** Pure Black, Dark Mode, High Contrast.
- **Layers:**
  - Layer 1: Background (blurred or pure black).
  - Layer 2: `<video>` element.
  - Layer 3: Black gradient overlay for readability.
  - Layer 4: Top UI (actions, metadata, controls).

### 4.2 Interaction Details

- **Loading State:** Rotating loading icon during buffering.
- **Seek Feedback:** Real-time preview or time tooltip.
- **Like Feedback:** Elastic scaling animation.

---

## 5. Technical Implementation Guide

### 5.1 Key Jellyfin API Mapping

Assume server base: `BASE_URL`.

#### Authenticate

```

POST {BASE_URL}/Users/AuthenticateByName
Payload: { Username: "...", Pw: "..." }
Header: X-Emby-Token (from response)

```

#### Get Views

```

GET {BASE_URL}/Users/{UserId}/Views

```

#### Get Items (Video List)

```

GET {BASE_URL}/Users/{UserId}/Items
Query:
ParentId
IncludeItemTypes = Movie,Video,Episode
Recursive = true
Fields = Path,MediaSources
Filters = IsPlayed, IsFavorite (optional)
SortBy = Random | DateCreated
Limit = 20
StartIndex = 0, 20, 40...

```

#### Build Stream URL

- **Direct Play:**

```

{BASE_URL}/Videos/{ItemId}/stream?static=true

```

- **HLS Mode (Recommended):**

```

{BASE_URL}/Videos/{ItemId}/master.m3u8?MediaSourceId={...}&PlaySessionId={...}

```

#### Favorite / Unfavorite

```

POST   {BASE_URL}/Users/{UserId}/FavoriteItems/{ItemId}
DELETE {BASE_URL}/Users/{UserId}/FavoriteItems/{ItemId}

```

#### Update Progress (Optional)

```

POST {BASE_URL}/Sessions/Playing/Progress

```

### 5.2 Performance Optimization

- **Virtualization:** Render only previous, current, next video.
- **Preloading:** Prefetch first ~5MB of the next video.

---

## 6. Constraints

- **Browser Compatibility:** Must support iOS Safari and Android Chrome; follow iOS autoplay rules.
- **Video Aspect Ratio:** Default to `object-fit: contain` with blurred background for wide videos.
- **Network Latency:** Provide smooth loading UI due to potential Jellyfin delays.
