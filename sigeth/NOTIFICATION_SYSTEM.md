# Notification System Documentation

## Overview

The app now has a global notification system that allows any component to trigger notifications when system changes occur. Notifications appear in the header dropdown and can be filtered by module/submodule.

## Architecture

### NotificationContext (`src/context/NotificationContext.tsx`)

- Manages global notification state
- Provides `addNotification()`, `markAsRead()`, `removeNotification()`, and `clearAll()` methods
- Auto-removes success notifications after 5 seconds
- Maintains notifications in order (newest first)

### useNotification Hook (`src/hooks/useNotification.ts`)

- React hook to access notification functionality from any component
- Must be used within NotificationProvider

### Notification Structure

```typescript
interface Notification {
  id: string; // Auto-generated
  module: string; // e.g., "Rooms Attendant", "Housekeeping"
  message: string; // Notification message
  time: string; // "Just now", "5 mins ago", etc.
  read: boolean; // Mark as read status
  type?: "success" | "error" | "info" | "warning"; // Notification type
}
```

## How to Use

### 1. Import the Hook

```typescript
import { useNotification } from "../../hooks/useNotification";
```

### 2. Use in Component

```typescript
export default function MyComponent() {
  const { addNotification } = useNotification();

  const handleSomeAction = () => {
    // Do something...
    addNotification(
      "Guest John Doe checked in to room 102",
      "Rooms Attendant",
      "success"
    );
  };

  return <button onClick={handleSomeAction}>Check In</button>;
}
```

## Notification Types

- **success**: Green notification (auto-hides after 5 seconds)
- **error**: Red notification (persistent until clicked)
- **info**: Blue notification (persistent)
- **warning**: Orange notification (persistent)

## Current Implementation

### Pages with Notifications

1. **CheckInWalkIn.tsx** - Triggers when walk-in guest checks in
2. **CheckInReservation.tsx** - Triggers when reservation guest checks in
3. **MoveGuest.tsx** - Triggers when guest moves to different room
4. **IndividualReservation.tsx** - Triggers when reservation is created/updated

### Notification Examples

- "Guest John Doe checked in to room 102" (CheckInWalkIn)
- "Guest Mary Smith moved from room 201 to 205" (MoveGuest)
- "Reservation for Ahmed Hassan created" (IndividualReservation)

## Adding Notifications to Other Pages

Follow this pattern:

1. Import the hook:

```typescript
import { useNotification } from "../../hooks/useNotification";
```

2. Get the function in your component:

```typescript
const { addNotification } = useNotification();
```

3. Call when action completes:

```typescript
addNotification("Your message here", "Module Name", "success");
```

## Header Integration

- Bell icon shows unread notification count
- Click to open dropdown with all notifications
- Click notification to mark as read
- "Clear All" button removes all notifications
- Notifications sorted by newest first
- Module badge color: amber/orange for all modules

## Future Enhancements

- Persist notifications to localStorage
- WebSocket integration for real-time backend notifications
- Filter notifications by module type
- Sound alerts for critical notifications
- Notification history/archive
