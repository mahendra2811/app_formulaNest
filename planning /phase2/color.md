Based on the **FormulaNest logo you finalized**—deep blue book, warm gold/orange glow, cream paper, and brown nest tones—I’d keep the full app palette around **Navy + Gold + Cream**, with brown used only as a subtle supporting color.

## Recommended FormulaNest color system

### Primary
Use **deep royal navy** as the main app color.

```ts
primary: "#0B2E59"
primaryLight: "#164B8F"
primaryDark: "#071D38"
```

Use it for:

- primary buttons
- active tabs
- headers
- selected chips
- links
- important icons

### Secondary
Use the **warm gold** from the logo.

```ts
secondary: "#F5A623"
secondaryLight: "#FFD166"
secondaryDark: "#C87500"
```

Use it for:

- highlights
- Formula of the Day
- selected formula cards
- badges
- progress
- premium-looking accents
- CTA accents

Do **not** make every button gold. Keep gold as an accent so the UI doesn't become too orange.

---

# Backgrounds

Your logo already has cream paper tones, so instead of pure white everywhere:

```ts
background: "#FFF9EE"
surface: "#FFFFFF"
surfaceSoft: "#FFF3DD"
```

This gives FormulaNest a warmer educational feel.

For cards:

```ts
card: "#FFFFFF"
cardWarm: "#FFF8EA"
cardBlue: "#F2F7FC"
```

---

# Text colors

```ts
textPrimary: "#14202B"
textSecondary: "#566573"
textMuted: "#8996A3"
textOnPrimary: "#FFFFFF"
textOnGold: "#292013"
```

Avoid using pure `#000000`.

---

# Brown / Nest colors

Use these very sparingly.

```ts
nestBrown: "#8B5A2B"
nestBrownLight: "#C58B52"
nestBrownSoft: "#E7C59D"
```

Best uses:

- decorative background elements
- separators
- illustrations
- formula-card accents
- onboarding backgrounds

I would **not use brown as a primary UI color**.

---

# Formula colors

You can also give mathematical content a subtle recognizable style.

```ts
formulaBlue: "#125BA6"
formulaGold: "#D98B00"
formulaBackground: "#FFF8E8"
formulaBorder: "#F1D59C"
```

Example Formula card:

```text
Background       #FFF8E8
Formula          #0B2E59
Important symbol #D98B00
Border           #F1D59C
```

---

# Success / warning / error

Keep standard semantic colors rather than trying to make everything blue/gold.

```ts
success: "#1F9D68"
successBg: "#EAF8F1"

warning: "#E69A19"
warningBg: "#FFF5DF"

error: "#D64545"
errorBg: "#FDECEC"

info: "#2878C8"
infoBg: "#EAF3FC"
```

For quizzes:

```text
Correct answer   Green
Wrong answer     Red
Selected answer  FormulaNest Blue
Unanswered       Neutral Gray
```

---

# Difficulty colors

Useful for formulas/questions:

```ts
easy: "#2E9D68"
medium: "#E7A526"
hard: "#D95858"
```

Don't overuse them outside question difficulty.

---

# Light theme

I would define the light theme approximately like:

```ts
export const lightTheme = {
  primary: "#0B2E59",
  primaryLight: "#164B8F",
  primaryDark: "#071D38",

  secondary: "#F5A623",
  secondaryLight: "#FFD166",
  secondaryDark: "#C87500",

  background: "#FFF9EE",
  surface: "#FFFFFF",
  surfaceSecondary: "#FFF3DD",

  card: "#FFFFFF",
  cardBlue: "#F2F7FC",
  cardGold: "#FFF8E8",

  text: "#14202B",
  textSecondary: "#566573",
  textMuted: "#8996A3",

  border: "#E7DED0",
  divider: "#EFE7DA",

  success: "#1F9D68",
  warning: "#E69A19",
  error: "#D64545",
  info: "#2878C8",

  nestBrown: "#8B5A2B",
};
```

---

# Dark theme

Your dark mode should retain the **navy + gold identity**, instead of using generic black.

```ts
export const darkTheme = {
  primary: "#69A9E8",
  primaryLight: "#87BDF0",
  primaryDark: "#164B8F",

  secondary: "#FFC14D",
  secondaryLight: "#FFD77A",
  secondaryDark: "#D98B00",

  background: "#081521",
  surface: "#101F2E",
  surfaceSecondary: "#162A3D",

  card: "#112437",
  cardBlue: "#122B44",
  cardGold: "#2B2419",

  text: "#F7F3EB",
  textSecondary: "#B8C4D0",
  textMuted: "#7F91A1",

  border: "#263A4C",
  divider: "#203344",

  success: "#4CCB91",
  warning: "#FFC04A",
  error: "#FF7373",
  info: "#69A9E8",

  nestBrown: "#A7794E",
};
```

Dark mode formula cards can look excellent like:

```text
Background       #112437
Formula          #F7F3EB
Highlight        #FFC14D
Border           #263A4C
```

---

# Bottom navigation

### Light

```text
Background       #FFFFFF
Active icon      #0B2E59
Active indicator #FFF0CF
Inactive         #8996A3
Border           #EFE7DA
```

### Dark

```text
Background       #101F2E
Active icon      #FFC14D
Active indicator #29354A
Inactive         #7F91A1
Border           #263A4C
```

You could use gold active icons in dark mode and navy active icons in light mode. That would look very FormulaNest-specific.

---

# Buttons

### Main button

```text
Background #0B2E59
Text       #FFFFFF
Pressed    #071D38
```

### Secondary button

```text
Background #FFF3DD
Text       #0B2E59
Border     #F5A623
```

### Important / Revision CTA

```text
Background #F5A623
Text       #292013
```

Example:

**Start Quiz** → Navy

**Quick Revision** → Gold

**View Formula Sheet** → Outline navy/gold

---

# Subject colors

You can use subject colors while still keeping FormulaNest branding around them.

```ts
subjectColors = {
  mathematics: "#2F6DB2",
  physics: "#6554C0",
  chemistry: "#D9822B",
  biology: "#2F9A63",
  accountancy: "#25899B",
  economics: "#BB6B24",
  businessStudies: "#7B61A8",
  history: "#9A5C3B",
  geography: "#37856A",
  politicalScience: "#536FA5",
  psychology: "#B55E87",
};
```

These should primarily be used on:

- small subject icons
- category indicators
- badges
- chart accents

not whole-page backgrounds.

---

# App background recommendation

For the homepage I would do:

```text
Main background       #FFF9EE
Header                White / very light cream
Hero card             Navy
Hero text             White
Hero accent           Gold
Normal cards          White
Selected cards        #FFF8E8
Formula headings      Navy
Important tags        Gold
```

It will feel connected to the logo without making every screen look like the logo itself.

---

# Your Expo configuration

You should also change your old green-gray values.

For the Android adaptive icon, I recommend:

```json
"adaptiveIcon": {
  "foregroundImage": "./assets/android-icon-foreground.png",
  "backgroundColor": "#FFF9EE"
}
```

For splash:

```json
[
  "expo-splash-screen",
  {
    "image": "./assets/splash-icon.png",
    "imageWidth": 220,
    "resizeMode": "contain",
    "backgroundColor": "#FFF9EE",
    "dark": {
      "backgroundColor": "#081521"
    }
  }
]
```

And because the app is now **FormulaNest**, I would also update the identity:

```json
{
  "expo": {
    "name": "FormulaNest",
    "slug": "formula-nest",
    "scheme": "formulanest",

    "ios": {
      "bundleIdentifier": "com.pooniya.formulanest"
    },

    "android": {
      "package": "com.pooniya.formulanest",
      "adaptiveIcon": {
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundColor": "#FFF9EE"
      }
    }
  }
}
```

If this package has **already been published on Google Play**, don't change the package ID. If it hasn't been published yet, `com.pooniya.formulanest` is much better than `com.formulalearner.app`.

### Final brand palette I'd lock

```text
Primary Navy      #0B2E59
Secondary Gold    #F5A623
Accent Gold       #FFD166
Cream Background  #FFF9EE
White Surface     #FFFFFF
Dark Background   #081521
Dark Surface      #101F2E
Main Text         #14202B
Muted Text        #566573
Nest Brown        #8B5A2B
```

This is the combination I would use across the whole **FormulaNest** app.