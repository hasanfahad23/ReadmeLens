# ReadmeLens Pro — Unified Icon System

All icons across the ReadmeLens platform are strictly centralized through `@readmelens/ui/icons` using `lucide-react`.

## Standards
- **Stroke Width**: Standardized to `2` for crisp, consistent visual hierarchy.
- **Sizes**: Fixed token scale `16`, `20`, `24` px (default `20`).
- **Color**: Derived via `currentColor` only to respect active theme and high contrast modes.
- **Accessibility**:
  - Decorative icons include `aria-hidden="true"` by default.
  - Interactive/Icon-only buttons include an `aria-label` attribute and visible tooltip.

## Action to Icon Mapping

| Former Indicator / Concept | Action / Usage | Icon Component | Export Name |
| :--- | :--- | :--- | :--- |
| Clipboard / Copy | Copy snippet / shell script | Lucide `Copy` | `IconCopy` |
| Checkmark / Success | Success / check validation | Lucide `CheckCircle2` / `Check` | `IconCheckCircle`, `IconCheck` |
| External Link | External link / repo link | Lucide `ExternalLink` | `IconExternalLink` |
| Magnifier / Search | In-document / Global search | Lucide `Search` | `IconSearch` |
| Gear / Settings | Settings and preferences | Lucide `Settings` | `IconSettings` |
| Sun / Moon / Monitor | Theme switcher (light, dark, system) | Lucide `Sun` / `Moon` / `Monitor` | `IconSun`, `IconMoon`, `IconMonitor` |
| Menu Bars | Mobile navigation menu | Lucide `Menu` | `IconMenu` |
| Cross / Dismiss | Close dialog / dismiss modal | Lucide `X` | `IconClose` |
| Warning Sign | Security threat / alert warning | Lucide `AlertTriangle` | `IconAlertTriangle` |
| Info Circle | Informational alert | Lucide `Info` | `IconInfo` |
| Document / Folder | Document file / Folder | Lucide `FileText` / `Folder` | `IconFile`, `IconFolder` |
| Link Chain | Anchor / cross-reference link | Lucide `Link` | `IconLink` |
| Download Arrow | Download SARIF / Export file | Lucide `Download` | `IconDownload` |
| Share Arrow | Share document link | Lucide `Share2` | `IconShare` |
| Printer | Print document | Lucide `Printer` | `IconPrint` |
| Terminal Prompt | Terminal quickstart | Lucide `Terminal` | `IconTerminal` |
| Shield | Security audit status | Lucide `Shield` | `IconShield` |
| Code Brackets | Code editor / runnable block | Lucide `Code2` | `IconCode` |
| Book | Document reader | Lucide `BookOpen` | `IconBook` |
| Clock / Timer | Reading time | Lucide `Clock` | `IconClock` |
| Layers | Table of contents layers | Lucide `Layers` | `IconLayers` |
