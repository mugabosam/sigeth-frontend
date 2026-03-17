# SIGETH Redesign - Find & Replace Quick Guide

Use your editor's Find & Replace (Ctrl+H or Cmd+Shift+H) on each remaining file.

## Step-by-Step Find & Replace (In Order)

### 1. Layout & Spacing Changes
```
FIND:     space-y-6
REPLACE:  space-y-4
(Replace All)

FIND:     space-y-5
REPLACE:  space-y-3
(Replace All)

FIND:     gap-4
REPLACE:  gap-3
(Replace All)

FIND:     p-6
REPLACE:  p-4
(Replace All)

FIND:     p-8
REPLACE:  p-4
(Replace All)

FIND:     py-4 px-6
REPLACE:  py-2 px-3
(Replace All)

FIND:     py-3 px-4
REPLACE:  py-2 px-3
(Replace All)
```

### 2. Border & Shadow Removal
```
FIND:     rounded-2xl
REPLACE:  rounded
(Replace All)

FIND:     rounded-xl
REPLACE:  rounded
(Replace All)

FIND:     rounded-lg
REPLACE:  rounded
(Replace All)

FIND:     shadow-md
REPLACE:  (delete - just remove)
(Replace All)

FIND:     shadow-lg
REPLACE:  (delete)
(Replace All)

FIND:     shadow-sm
REPLACE:  (delete)
(Replace All)

FIND:     shadow-2xl
REPLACE:  (delete)
(Replace All)

FIND:     shadow-xl
REPLACE:  (delete)
(Replace All)
```

### 3. Gradient Removal (High Priority)
```
FIND:     bg-gradient-to-r from-blue-50 to-indigo-50
REPLACE:  bg-white border border-hotel-border rounded p-4
(Replace All)

FIND:     bg-gradient-to-r from-blue-600 to-indigo-600
REPLACE:  bg-hotel-gold
(Replace All)

FIND:     bg-gradient-to-br from-amber-400 to-amber-600
REPLACE:  bg-hotel-gold
(Replace All)

FIND:     bg-gradient-to-br from-blue-600 to-blue-800
REPLACE:  bg-hotel-navy
(Replace All)

FIND:     bg-gradient-to-br from-green-50 to-emerald-50
REPLACE:  bg-hotel-cream
(Replace All)

FIND:     bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900
REPLACE:  bg-hotel-navy
(Replace All)

FIND:     bg-gradient-to-r from-
REPLACE:  [Check remaining instances manually - replace gradients case by case]
```

### 4. Color Replacements
```
FIND:     border-gray-200
REPLACE:  border-hotel-border
(Replace All)

FIND:     border-gray-300
REPLACE:  border-hotel-border
(Replace All)

FIND:     border-gray-100
REPLACE:  border-hotel-border
(Replace All)

FIND:     text-gray-800
REPLACE:  text-hotel-text-primary
(Replace All)

FIND:     text-gray-600
REPLACE:  text-hotel-text-secondary
(Replace All)

FIND:     text-gray-500
REPLACE:  text-hotel-text-secondary
(Replace All)

FIND:     text-gray-700
REPLACE:  text-hotel-text-primary
(Replace All)

FIND:     text-gray-900
REPLACE:  text-hotel-text-primary
(Replace All)

FIND:     hover:bg-gray-100
REPLACE:  hover:bg-hotel-cream
(Replace All)

FIND:     hover:bg-gray-50
REPLACE:  hover:bg-hotel-cream
(Replace All)

FIND:     bg-gray-50
REPLACE:  bg-white
(Replace All)

FIND:     bg-blue-50
REPLACE:  bg-hotel-cream
(Replace All)

FIND:     bg-red-50
REPLACE:  (context-dependent - keep for error backgrounds, but use lighter tone)
```

### 5. Form Field Styling
```
FIND:     focus:ring-2 focus:ring-blue-500
REPLACE:  focus:ring-1 focus:ring-hotel-gold
(Replace All)

FIND:     focus:ring-2 focus:ring-blue-400
REPLACE:  focus:ring-1 focus:ring-hotel-gold
(Replace All)

FIND:     focus:border-transparent
REPLACE:  (delete - not needed with ring styling)
(Replace All)

FIND:     hover:border-blue-400
REPLACE:  (delete or replace context-specifically)
(Replace All)
```

### 6. Button Styling
```
FIND:     bg-amber-500 text-white
REPLACE:  bg-hotel-gold text-white
(Replace All)

FIND:     bg-green-500 text-white
REPLACE:  bg-hotel-gold text-white
(Replace All)

FIND:     bg-blue-600 text-white
REPLACE:  bg-hotel-gold text-white
(Replace All)

FIND:     hover:bg-amber-600
REPLACE:  hover:bg-hotel-gold-dark
(Replace All)

FIND:     hover:bg-green-600
REPLACE:  hover:bg-hotel-gold-dark
(Replace All)

FIND:     hover:bg-blue-700
REPLACE:  hover:bg-hotel-gold-dark
(Replace All)

FIND:     border-2 border-green-500 text-green-700 px-6 py-2 rounded-lg ... bg-green-50
REPLACE:  border border-hotel-border text-hotel-text-primary px-4 py-2 rounded hover:bg-hotel-cream
(Careful - review context)

FIND:     border-green-500
REPLACE:  border-hotel-border
(Replace All)

FIND:     text-green-700
REPLACE:  text-hotel-text-primary
(Replace All)

FIND:     text-green-600
REPLACE:  text-hotel-gold
(Replace All)
```

### 7. Text Sizing
```
FIND:     text-3xl
REPLACE:  text-2xl
(Replace All)

FIND:     text-xl
REPLACE:  text-lg
(Replace All - but check table headers, they might stay text-base)

FIND:     text-lg
REPLACE:  text-base
(Replace All - careful with section headings)
```

### 8. Table Styling (Most Important!)
```
FIND:     <thead className="...">
REPLACE:  <thead className="bg-hotel-navy text-white sticky top-0">
(Check each table, replace manually for accuracy)

FIND:     <th className="text-left py-1 px-2">
REPLACE:  <th className="text-left py-2 px-2 font-medium">
(Check each occurrence)

FIND:     <tr className="border-b hover:bg-amber-50
REPLACE:  <tr className="border-b border-hotel-border hover:bg-hotel-cream
(Replace All)

FIND:     <tr className="border-b hover:bg-blue-50
REPLACE:  <tr className="border-b border-hotel-border hover:bg-hotel-cream
(Replace All)

FIND:     <tr className="border-b hover:bg-green-50
REPLACE:  <tr className="border-b border-hotel-border hover:bg-hotel-cream
(Replace All)

FIND:     py-1 px-2
REPLACE:  py-2 px-2
(Replace in table bodies only - check context)

FIND:     font-mono text-right
REPLACE:  font-mono text-right
(Keep as is)
```

### 9. Section Headers
```
FIND:     text-lg font-bold text-gray-800
REPLACE:  text-base font-semibold text-hotel-text-primary
(Review context - might be h3, adjust sizing as needed)

FIND:     text-sm font-bold text-gray-800
REPLACE:  text-sm font-semibold text-hotel-text-primary
(Replace All)

FIND:     uppercase mb-4
REPLACE:  uppercase tracking-wide mb-3
(Add tracking for professional look)
```

### 10. Animation & Transform Removal (Optional but Clean)
```
FIND:     transform hover:scale-105
REPLACE:  (delete entire class or replace with transition-colors)
(Replace All)

FIND:     transform hover:scale-104
REPLACE:  (delete)
(Replace All)

FIND:     transition-all
REPLACE:  transition-colors
(Replace All)
```

## Manual Fixes Needed (Search for these patterns and review)

After running all find/replace, search for these and fix case-by-case:

1. **Error styling**: Ensure all `text-red-*` and `border-red-*` are replaced with `text-hotel-danger` and `border-hotel-danger`
2. **Success badges**: Replace `text-green-*` with `text-hotel-success` in status badges
3. **Floating divs**: Remove any `absolute inset-0 pointer-events-none` background decorations
4. **Transform animations**: Search for `transform scale` and remove
5. **Backdrop blur**: Remove all `backdrop-blur*` classes
6. **Ring effects**: Ensure all `ring-*` use `ring-hotel-gold` for focus states

## Files to Apply This To (13 remaining)

1. ✅ GroupReservation.tsx (DONE)
2. ✅ GroupMemberReservation.tsx (DONE)
3. ✅ CheckInReservation.tsx (DONE)
4. CheckInWalkIn.tsx
5. CheckInGroup.tsx
6. TwinRecording.tsx
7. FindRoom.tsx
8. MoveGuest.tsx
9. CheckOut.tsx
10. InvoicePreview.tsx
11. InvoiceByGuest.tsx
12. InvoiceByGroup.tsx
13. ArrivalOn.tsx
14. ArrivalOff.tsx
15. RoomsByStatus.tsx
16. DailyConsumptions.tsx

**Housekeeping & Banqueting pages** (21 files total) - Apply same pattern

## Pro Tips

- Open Find & Replace in your editor
- Check "Match Case" and "Whole Word" when appropriate
- **Always preview** before replacing all to catch edge cases
- Test the UI after each file - changes should look clean and professional
- Group similar replacements together (all borders first, then colors, etc.)
- Keep this file open as reference while editing

## Expected Result

After applying all replacements:
- No gradients (solid colors only)
- No shadows (except subtle borders)
- Compact spacing (gap-3, p-4)
- Proper color scheme (hotel-gold, hotel-navy, hotel-cream, etc.)
- Professional typography (font-display for headings)
- Tables with dark headers and alternating rows
- Forms with proper 4-column grids
- Clean, enterprise PMS aesthetic

Good luck! The pattern is consistent across all files.
