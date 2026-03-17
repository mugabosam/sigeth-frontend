# SIGETH Professional Design Redesign Pattern

## Color Palette (Hotel Theme)
```
Primary Colors:
- Navy Background: #2C3E50 (sidebar)
- Cream/Off-white: #F5F3EF (page background)
- Paper Light: #FAFAF7 (alternating rows)
- Gold Accent: #B8860B (buttons, active states)
- Dark Gold: #996F0A (hover states)
- Border Color: #E5E1DB

Text Colors:
- Primary: #1A1A1A (headings, primary text)
- Secondary: #6B7280 (labels, descriptions)

Status Colors:
- Success: #2D7D46 (green)
- Danger: #C53030 (red)
- Warning: #D69E2E (yellow)
- Info: #2B6CB0 (blue)
```

## Key Changes Applied

### Remove:
1. All `bg-gradient-to-*` gradients ✓
2. All `shadow-*` shadows except `shadow-sm` (REMOVE) ✓
3. All glow effects (`shadow-*-500/20`) ✓
4. Excessive rounded corners (`rounded-2xl`, `rounded-xl` → `rounded`) ✓
5. All `transform hover:scale-*` animations ✓
6. Semi-transparent backgrounds (`bg-white/10`, `backdrop-blur`) ✓
7. Deep colors like `bg-slate-700`, `bg-blue-600/30` ✓
8. Emoji-style icon usage ✓

### Replace With:
1. Solid colors from hotel palette ✓
2. `border border-hotel-border` for all cards ✓
3. Compact spacing: `p-4` instead of `p-6` or `p-8` ✓
4. `rounded` instead of `rounded-lg`, `rounded-2xl` ✓
5. `text-xs`, `text-sm` for dense data ✓
6. Font families: `font-display` for headings (serif), `font-body` for content ✓
7. `text-hotel-*` color classes throughout ✓
8. Hover states: `hover:bg-hotel-cream` for subtle transitions ✓

## Tailwind Classes Mapping

| Old | New |
|-----|-----|
| `bg-gradient-to-r from-blue-50 to-indigo-50` | `bg-hotel-cream` |
| `border border-gray-200` | `border border-hotel-border` |
| `rounded-lg` | `rounded` |
| `rounded-2xl` | `rounded` |
| `shadow-md` | (removed) |
| `shadow-lg` | `shadow` (subtle only) |
| `text-blue-600` | `text-hotel-gold` |
| `bg-blue-100` | `bg-hotel-cream` |
| `text-gray-800` | `text-hotel-text-primary` |
| `text-gray-500` | `text-hotel-text-secondary` |
| `p-6` | `p-4` |
| `p-8` | `p-4` |
| `py-4 px-6` | `py-2 px-3` |
| `gap-4` | `gap-3` |
| `text-lg` | `text-base` |
| `text-xl` | `text-lg` |

## Component Patterns

### Page Title
```tsx
<h1 className="text-2xl font-display font-bold text-hotel-text-primary">
  {title}
</h1>
```

### Card/Container
```tsx
<div className="bg-white border border-hotel-border rounded p-4">
  {/* content */}
</div>
```

### Form Fields
```tsx
<div>
  <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
    {label}
  </label>
  <input
    className="w-full border border-hotel-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
  />
</div>
```

### Button - Primary (Gold)
```tsx
<button className="bg-hotel-gold text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors">
  {label}
</button>
```

### Button - Secondary (Bordered)
```tsx
<button className="border border-hotel-border text-hotel-text-primary px-4 py-2 rounded text-sm font-medium hover:bg-hotel-cream transition-colors">
  {label}
</button>
```

### Table Header
```tsx
<thead className="bg-hotel-navy text-white">
  <tr>
    <th className="text-left py-2 px-2 font-medium">{header}</th>
  </tr>
</thead>
```

### Table Row
```tsx
<tr className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer">
  <td className="py-2 px-2 text-hotel-text-primary">{data}</td>
</tr>
```

### Badge/Status
```tsx
<span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
  {status}
</span>
```

### Section Header
```tsx
<h3 className="text-sm font-semibold text-hotel-text-primary mb-3 uppercase tracking-wide">
  {section}
</h3>
```

## Typography

Headings:
```
h1: text-2xl font-display font-bold
h2: text-xl font-display font-bold
h3: text-lg font-display font-semibold (or text-sm uppercase tracking-wide for sections)
h4: text-base font-display font-semibold
```

Body:
```
Default: text-sm text-hotel-text-primary
Small: text-xs text-hotel-text-secondary
Compact data: text-xs (numbers: font-mono, text-right)
```

## Layout Grids

Form fields:
- 1 column on mobile
- 4 columns on desktop (md:grid-cols-4)
- Spacing: gap-3

Buttons in rows:
- Use `flex gap-2` with `pt-2 border-t border-hotel-border`

## Status Colors (Applied Consistently)

- Vacant (VC): bg-green-100 text-green-800 or text-hotel-success
- Occupied (OCC): bg-red-100 text-red-800 or text-hotel-danger
- Checked Out (CO): bg-yellow-100 text-yellow-800 or text-hotel-warning
- Out of Order (OOO): bg-gray-100 text-gray-800

## Consistency Rules

1. All cards: `bg-white border border-hotel-border rounded p-4`
2. All primary actions: `bg-hotel-gold text-white hover:bg-hotel-gold-dark`
3. All secondary actions: `border border-hotel-border hover:bg-hotel-cream`
4. All labels: `text-xs font-medium text-hotel-text-secondary`
5. All borders: `border-hotel-border` (never use gray-* borders)
6. All page backgrounds: #F5F3EF (already set in Layout.tsx)
7. Form errors: `text-xs text-hotel-danger mt-1`
8. Focus states: `focus:outline-none focus:ring-1 focus:ring-hotel-gold`
