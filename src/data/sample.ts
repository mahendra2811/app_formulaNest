import type { ContentItem, Dataset, Question } from "../types/content";

const classes = Array.from({ length: 7 }, (_, index) => ({
  id: `class-${index + 6}`,
  name: `Class ${index + 6}`,
}));
const exams = [
  { id: "jee-main", name: "JEE Main" },
  { id: "jee-advanced", name: "JEE Advanced" },
  { id: "neet", name: "NEET" },
];
const boards = [
  { id: "cbse", name: "CBSE" },
  { id: "rbse", name: "RBSE" },
  { id: "icse", name: "ICSE" },
  { id: "other", name: "Other" },
];
const streams = [
  { id: "science", name: "Science" },
  { id: "commerce", name: "Commerce" },
  { id: "arts", name: "Arts" },
];
const subjects = [
  { id: "mathematics", name: "Mathematics" },
  { id: "physics", name: "Physics" },
];
const chapters = [
  {
    id: "quadratic-equations",
    name: "Quadratic Equations",
    subjectId: "mathematics",
  },
  { id: "trigonometry", name: "Trigonometry", subjectId: "mathematics" },
  {
    id: "current-electricity",
    name: "Current Electricity",
    subjectId: "physics",
  },
  { id: "electrostatics", name: "Electrostatics", subjectId: "physics" },
];
const topics = [
  {
    id: "quadratic-roots",
    name: "Roots and Discriminant",
    chapterId: "quadratic-equations",
  },
  {
    id: "quadratic-relations",
    name: "Relations Between Roots",
    chapterId: "quadratic-equations",
  },
  { id: "trig-identities", name: "Identities", chapterId: "trigonometry" },
  {
    id: "trig-ratios",
    name: "Trigonometric Ratios",
    chapterId: "trigonometry",
  },
  {
    id: "circuit-current",
    name: "Current and Resistance",
    chapterId: "current-electricity",
  },
  {
    id: "circuit-networks",
    name: "Circuit Networks",
    chapterId: "current-electricity",
  },
  { id: "electric-field", name: "Electric Field", chapterId: "electrostatics" },
  {
    id: "electric-potential",
    name: "Potential and Energy",
    chapterId: "electrostatics",
  },
];

type FormulaSeed = {
  title: string;
  expression: string;
  summary: string;
  explanation: string;
  example: string;
  whenToUse: string;
  commonMistake: string;
  variables: ContentItem["variables"];
  units?: string[];
  topic: string;
  difficulty?: ContentItem["difficulty"];
  importance?: number;
};

const formulaSeeds: FormulaSeed[] = [
  {
    title: "Quadratic formula",
    expression: "x = (−b ± √(b² − 4ac)) / 2a",
    summary: "Finds both roots of ax² + bx + c = 0.",
    explanation:
      "The formula follows by completing the square and works for every quadratic with a ≠ 0.",
    example: "For x² − 5x + 6 = 0, x = (5 ± 1)/2, so x = 2 or 3.",
    whenToUse:
      "Use when a quadratic does not factor quickly or exact roots are required.",
    commonMistake: "Keep the denominator 2a under the entire numerator.",
    variables: [
      {
        symbol: "a, b, c",
        meaning: "Coefficients in ax² + bx + c = 0; a ≠ 0",
        unit: "Depends on the equation",
      },
    ],
    topic: "quadratic-roots",
  },
  {
    title: "Discriminant",
    expression: "D = b² − 4ac",
    summary: "Predicts the nature of a quadratic’s roots.",
    explanation:
      "The sign of D determines whether real roots are distinct, repeated, or absent.",
    example:
      "For x² − 5x + 6, D = 25 − 24 = 1, so there are two distinct real roots.",
    whenToUse: "Use to classify roots without solving the full equation.",
    commonMistake:
      "A negative discriminant means no real roots, but there are still complex roots.",
    variables: [
      { symbol: "D", meaning: "Discriminant", unit: "Coefficient-dependent" },
      {
        symbol: "a, b, c",
        meaning: "Coefficients of the quadratic",
        unit: "Depends on the equation",
      },
    ],
    topic: "quadratic-roots",
  },
  {
    title: "Sum of quadratic roots",
    expression: "α + β = −b/a",
    summary: "Gives the sum of roots directly from coefficients.",
    explanation:
      "Vieta’s relations connect roots α, β to the coefficients of ax² + bx + c.",
    example: "For 2x² − 7x + 3 = 0, α + β = 7/2.",
    whenToUse:
      "Use when a question asks for a root sum or a symmetric expression in roots.",
    commonMistake: "The sum is −b/a; the negative sign is easy to lose.",
    variables: [
      { symbol: "α, β", meaning: "The two roots", unit: "Same as x" },
      {
        symbol: "a, b",
        meaning: "Leading and linear coefficients",
        unit: "Equation-dependent",
      },
    ],
    topic: "quadratic-relations",
  },
  {
    title: "Product of quadratic roots",
    expression: "αβ = c/a",
    summary: "Gives the product of roots directly from coefficients.",
    explanation:
      "The constant-to-leading-coefficient ratio equals the product of the roots.",
    example: "For 2x² − 7x + 3 = 0, αβ = 3/2.",
    whenToUse:
      "Use to find a product or simplify symmetric expressions in roots.",
    commonMistake: "Do not use −c/a; only the root sum carries the minus sign.",
    variables: [
      { symbol: "α, β", meaning: "The two roots", unit: "Same as x" },
      {
        symbol: "a, c",
        meaning: "Leading and constant coefficients",
        unit: "Equation-dependent",
      },
    ],
    topic: "quadratic-relations",
  },
  {
    title: "Vertex x-coordinate",
    expression: "xᵥ = −b/(2a)",
    summary: "Locates the axis of symmetry of a parabola.",
    explanation:
      "The vertex lies halfway between the two roots, or at the stationary point.",
    example: "For y = x² − 6x + 5, xᵥ = 3.",
    whenToUse: "Use to locate the turning point or axis of symmetry.",
    commonMistake:
      "This gives only the x-coordinate; substitute it to find the vertex y-coordinate.",
    variables: [
      {
        symbol: "a, b",
        meaning: "Quadratic and linear coefficients",
        unit: "Equation-dependent",
      },
      { symbol: "xᵥ", meaning: "Vertex x-coordinate", unit: "Same as x" },
    ],
    topic: "quadratic-roots",
  },
  {
    title: "Perfect-square trinomial",
    expression: "x² ± 2px + p² = (x ± p)²",
    summary: "Factors a quadratic with a repeated root.",
    explanation:
      "The middle term must be twice the product of the square roots of the first and last terms.",
    example: "x² + 8x + 16 = (x + 4)².",
    whenToUse:
      "Use when the first and last terms are squares and the middle term matches.",
    commonMistake:
      "Check the sign of the middle term before choosing the sign inside brackets.",
    variables: [
      { symbol: "x", meaning: "Variable", unit: "Problem-dependent" },
      {
        symbol: "p",
        meaning: "Square root of the constant term",
        unit: "Same as x",
      },
    ],
    topic: "quadratic-roots",
  },
  {
    title: "Quadratic vertex y-coordinate",
    expression: "yᵥ = −D/(4a)",
    summary: "Finds the minimum or maximum value of ax² + bx + c.",
    explanation:
      "Substituting x = −b/(2a) gives the vertex value −(b² − 4ac)/(4a).",
    example: "For y = x² − 4x + 1, D = 12 and yᵥ = −3.",
    whenToUse: "Use to find an extremum without expanding a completed square.",
    commonMistake:
      "The vertex is a minimum only when a > 0; when a < 0 it is a maximum.",
    variables: [
      { symbol: "D", meaning: "b² − 4ac", unit: "Coefficient-dependent" },
      {
        symbol: "a",
        meaning: "Quadratic coefficient",
        unit: "Equation-dependent",
      },
    ],
    topic: "quadratic-roots",
  },
  {
    title: "Quadratic equation from roots",
    expression: "x² − (α + β)x + αβ = 0",
    summary: "Builds a monic quadratic from its two roots.",
    explanation:
      "Expanding (x − α)(x − β) gives the sum and product coefficients.",
    example: "Roots 2 and 5 give x² − 7x + 10 = 0.",
    whenToUse: "Use when roots are known and the equation is required.",
    commonMistake:
      "The sum appears with a minus sign; the product appears with a plus sign.",
    variables: [{ symbol: "α, β", meaning: "Given roots", unit: "Same as x" }],
    topic: "quadratic-relations",
  },
  {
    title: "Sine of a sum",
    expression: "sin(A + B) = sin A cos B + cos A sin B",
    summary: "Expands the sine of a sum of angles.",
    explanation:
      "The cross terms add for sine of a sum; one term changes sign for a difference.",
    example: "sin(45° + 30°) = (√6 + √2)/4.",
    whenToUse: "Use to find exact values or transform sums of angles.",
    commonMistake:
      "Do not use the cosine sum sign pattern; both sine terms are positive here.",
    variables: [
      { symbol: "A, B", meaning: "Angles", unit: "Degrees or radians" },
    ],
    topic: "trig-identities",
  },
  {
    title: "Cosine of a sum",
    expression: "cos(A + B) = cos A cos B − sin A sin B",
    summary: "Expands the cosine of a sum of angles.",
    explanation:
      "The sine-product term is negative for a sum and positive for a difference.",
    example: "cos(60° + 30°) = 0.",
    whenToUse: "Use for exact angle evaluation or identity transformations.",
    commonMistake: "The minus sign belongs to the sine-product term.",
    variables: [
      { symbol: "A, B", meaning: "Angles", unit: "Degrees or radians" },
    ],
    topic: "trig-identities",
  },
  {
    title: "Tangent of a sum",
    expression: "tan(A + B) = (tan A + tan B)/(1 − tan A tan B)",
    summary: "Combines two tangent ratios into one.",
    explanation:
      "Divide the sine-sum identity by the cosine-sum identity where the denominator is nonzero.",
    example: "tan(45° + 30°) = (1 + 1/√3)/(1 − 1/√3).",
    whenToUse: "Use when tangent values of component angles are known.",
    commonMistake: "The denominator is 1 − tan A tan B for a sum.",
    variables: [
      {
        symbol: "A, B",
        meaning: "Angles with nonzero denominator",
        unit: "Degrees or radians",
      },
    ],
    topic: "trig-identities",
  },
  {
    title: "Sine double angle",
    expression: "sin 2A = 2 sin A cos A",
    summary: "Rewrites the sine of twice an angle.",
    explanation: "Set both angles equal to A in the sine addition identity.",
    example: "If sin A = 3/5 and cos A = 4/5, sin 2A = 24/25.",
    whenToUse:
      "Use to simplify a double-angle expression or relate sine and cosine.",
    commonMistake:
      "Do not replace this with 2 sin A; the cosine factor is required.",
    variables: [{ symbol: "A", meaning: "Angle", unit: "Degrees or radians" }],
    topic: "trig-identities",
  },
  {
    title: "Cosine double angle",
    expression: "cos 2A = cos² A − sin² A",
    summary: "Expresses cosine of twice an angle using squared ratios.",
    explanation: "The identity also equals 2cos²A − 1 or 1 − 2sin²A.",
    example: "For A = 30°, cos 2A = 1/2.",
    whenToUse: "Use when either sine or cosine squared is already known.",
    commonMistake:
      "Choose the equivalent form that matches the ratio given; do not mix them.",
    variables: [{ symbol: "A", meaning: "Angle", unit: "Degrees or radians" }],
    topic: "trig-identities",
  },
  {
    title: "Tangent double angle",
    expression: "tan 2A = 2 tan A/(1 − tan² A)",
    summary: "Finds the tangent of twice an angle.",
    explanation: "Set both angles equal in the tangent addition identity.",
    example: "For tan A = 1/2, tan 2A = 4/3.",
    whenToUse: "Use when tan A is known and the denominator is nonzero.",
    commonMistake: "The denominator is 1 − tan²A, not 1 + tan²A.",
    variables: [{ symbol: "A", meaning: "Angle", unit: "Degrees or radians" }],
    topic: "trig-identities",
  },
  {
    title: "Pythagorean trigonometric identity",
    expression: "sin² A + cos² A = 1",
    summary: "Connects sine and cosine of the same angle.",
    explanation:
      "It follows by dividing the right-triangle relation opposite² + adjacent² = hypotenuse² by hypotenuse².",
    example: "If sin A = 5/13 for an acute angle, cos A = 12/13.",
    whenToUse:
      "Use to find one ratio from the other or simplify squared ratios.",
    commonMistake:
      "The identity uses squares: sin²A + cos²A, not sin A + cos A.",
    variables: [{ symbol: "A", meaning: "Angle", unit: "Degrees or radians" }],
    topic: "trig-identities",
  },
  {
    title: "Tangent ratio",
    expression: "tan A = opposite/adjacent = sin A/cos A",
    summary: "Relates the two legs of a right triangle.",
    explanation:
      "Divide the sine ratio by the cosine ratio to obtain opposite over adjacent.",
    example: "For a 3-4-5 triangle, tan A = 3/4 when 3 is opposite A.",
    whenToUse:
      "Use in a right triangle when opposite and adjacent sides are known.",
    commonMistake:
      "Identify the sides relative to angle A; opposite and adjacent change with the angle.",
    variables: [
      {
        symbol: "A",
        meaning: "Acute triangle angle",
        unit: "Degrees or radians",
      },
    ],
    topic: "trig-ratios",
  },
  {
    title: "Sine rule",
    expression: "a/sin A = b/sin B = c/sin C",
    summary: "Relates each side to the sine of its opposite angle.",
    explanation:
      "In any triangle, each side-to-opposite-sine ratio equals the circumdiameter.",
    example: "If a = 8 and A = 30°, then the common ratio is 16.",
    whenToUse: "Use when a known side-opposite-angle pair is available.",
    commonMistake:
      "Pair each side with its opposite angle, not an adjacent angle.",
    variables: [
      {
        symbol: "a, b, c",
        meaning: "Side lengths opposite A, B, C",
        unit: "Length",
      },
      {
        symbol: "A, B, C",
        meaning: "Opposite interior angles",
        unit: "Degrees or radians",
      },
    ],
    topic: "trig-ratios",
  },
  {
    title: "Cosine rule",
    expression: "c² = a² + b² − 2ab cos C",
    summary: "Connects two sides and their included angle to the third side.",
    explanation:
      "This generalizes Pythagoras; when C = 90°, the cosine term vanishes.",
    example: "For a = b = 5 and C = 60°, c² = 25, so c = 5.",
    whenToUse:
      "Use with two sides and the included angle, or with all three sides to find an angle.",
    commonMistake:
      "Angle C must be opposite side c and included between a and b.",
    variables: [
      { symbol: "a, b, c", meaning: "Triangle side lengths", unit: "Length" },
      {
        symbol: "C",
        meaning: "Angle opposite side c",
        unit: "Degrees or radians",
      },
    ],
    topic: "trig-ratios",
  },
  {
    title: "Right-triangle sine ratio",
    expression: "sin A = opposite/hypotenuse",
    summary: "Compares the opposite side with the hypotenuse.",
    explanation:
      "This is the SOH part of SOH-CAH-TOA for an acute right-triangle angle.",
    example: "In a 3-4-5 triangle, if the opposite side is 3, sin A = 3/5.",
    whenToUse: "Use when the opposite side and hypotenuse are involved.",
    commonMistake: "The hypotenuse is always opposite the right angle.",
    variables: [
      { symbol: "A", meaning: "Acute angle", unit: "Degrees or radians" },
    ],
    topic: "trig-ratios",
  },
  {
    title: "Right-triangle cosine ratio",
    expression: "cos A = adjacent/hypotenuse",
    summary: "Compares the adjacent side with the hypotenuse.",
    explanation:
      "This is the CAH part of SOH-CAH-TOA for an acute right-triangle angle.",
    example: "In a 3-4-5 triangle, if the adjacent side is 4, cos A = 4/5.",
    whenToUse: "Use when the adjacent side and hypotenuse are involved.",
    commonMistake: "The adjacent leg touches A but is not the hypotenuse.",
    variables: [
      { symbol: "A", meaning: "Acute angle", unit: "Degrees or radians" },
    ],
    topic: "trig-ratios",
  },
  {
    title: "Ohm’s law",
    expression: "V = IR",
    summary: "Relates potential difference, current, and resistance.",
    explanation:
      "For an ohmic conductor at constant physical conditions, voltage is proportional to current.",
    example: "A 4 Ω resistor carrying 2 A has a 8 V potential difference.",
    whenToUse: "Use for an ohmic element when any two of V, I, R are known.",
    commonMistake: "Check that V is in volts, I in amperes, and R in ohms.",
    variables: [
      { symbol: "V", meaning: "Potential difference", unit: "volt (V)" },
      { symbol: "I", meaning: "Current", unit: "ampere (A)" },
      { symbol: "R", meaning: "Resistance", unit: "ohm (Ω)" },
    ],
    topic: "circuit-current",
  },
  {
    title: "Resistance of a uniform wire",
    expression: "R = ρL/A",
    summary: "Finds wire resistance from its material and dimensions.",
    explanation:
      "Resistance increases with length and resistivity, and decreases with cross-sectional area.",
    example:
      "Doubling a wire’s length while keeping its area and material fixed doubles R.",
    whenToUse: "Use for a uniform wire with known resistivity and dimensions.",
    commonMistake:
      "Use cross-sectional area, not diameter, and convert dimensions consistently.",
    variables: [
      { symbol: "R", meaning: "Resistance", unit: "ohm (Ω)" },
      { symbol: "ρ", meaning: "Material resistivity", unit: "Ω·m" },
      { symbol: "L", meaning: "Wire length", unit: "m" },
      { symbol: "A", meaning: "Cross-sectional area", unit: "m²" },
    ],
    topic: "circuit-current",
  },
  {
    title: "Series resistance",
    expression: "Rₛ = R₁ + R₂ + ⋯",
    summary: "Adds resistances connected in series.",
    explanation:
      "The same current passes through every series component and voltage drops add.",
    example: "2 Ω and 3 Ω in series have total resistance 5 Ω.",
    whenToUse: "Use when components share one unbranched current path.",
    commonMistake: "Series resistances add; do not apply the reciprocal rule.",
    variables: [
      {
        symbol: "Rₛ",
        meaning: "Equivalent series resistance",
        unit: "ohm (Ω)",
      },
      { symbol: "R₁, R₂", meaning: "Individual resistances", unit: "ohm (Ω)" },
    ],
    topic: "circuit-networks",
  },
  {
    title: "Parallel resistance",
    expression: "1/Rₚ = 1/R₁ + 1/R₂ + ⋯",
    summary: "Combines resistances across common parallel branches.",
    explanation:
      "Each branch has the same potential difference while branch currents add.",
    example: "Two 6 Ω resistors in parallel give Rₚ = 3 Ω.",
    whenToUse: "Use when each resistor is connected across the same two nodes.",
    commonMistake:
      "The equivalent resistance is less than the smallest branch resistance.",
    variables: [
      {
        symbol: "Rₚ",
        meaning: "Equivalent parallel resistance",
        unit: "ohm (Ω)",
      },
      { symbol: "R₁, R₂", meaning: "Branch resistances", unit: "ohm (Ω)" },
    ],
    topic: "circuit-networks",
  },
  {
    title: "Electrical power",
    expression: "P = VI = I²R = V²/R",
    summary: "Measures the rate of electrical energy transfer.",
    explanation:
      "The equivalent forms follow by substituting Ohm’s law into P = VI.",
    example: "A 2 A current through 5 Ω dissipates P = 20 W.",
    whenToUse:
      "Use the form matching the quantities known for an ohmic component.",
    commonMistake:
      "Use I²R only with current through that component, not total current in a branch.",
    variables: [
      { symbol: "P", meaning: "Power", unit: "watt (W)" },
      { symbol: "V", meaning: "Potential difference", unit: "volt (V)" },
      { symbol: "I", meaning: "Current", unit: "ampere (A)" },
      { symbol: "R", meaning: "Resistance", unit: "ohm (Ω)" },
    ],
    topic: "circuit-current",
  },
  {
    title: "Drift current",
    expression: "I = neAvd",
    summary: "Relates charge-carrier drift speed to current.",
    explanation:
      "Current equals charge crossing a section per unit time; n counts carriers per volume.",
    example:
      "Doubling drift speed doubles current if carrier density and wire area stay fixed.",
    whenToUse:
      "Use for a conductor model when carrier density and drift speed are provided.",
    commonMistake:
      "Use the magnitude of electron drift speed; conventional current points oppositely.",
    variables: [
      { symbol: "n", meaning: "Carrier number density", unit: "m⁻³" },
      { symbol: "e", meaning: "Elementary charge magnitude", unit: "C" },
      { symbol: "A", meaning: "Cross-sectional area", unit: "m²" },
      { symbol: "vd", meaning: "Drift speed", unit: "m/s" },
    ],
    topic: "circuit-current",
  },
  {
    title: "Coulomb’s law",
    expression: "F = k|q₁q₂|/r²",
    summary: "Gives the force magnitude between two point charges.",
    explanation:
      "The force acts along the line joining the charges and is attractive for unlike signs.",
    example:
      "Doubling the separation reduces the force magnitude to one quarter.",
    whenToUse:
      "Use for point charges or spherically symmetric charge distributions at external points.",
    commonMistake:
      "The equation gives magnitude; determine attraction or repulsion from the charge signs.",
    variables: [
      {
        symbol: "F",
        meaning: "Electrostatic force magnitude",
        unit: "newton (N)",
      },
      { symbol: "k", meaning: "Coulomb constant", unit: "N·m²/C²" },
      { symbol: "q₁, q₂", meaning: "Point charges", unit: "coulomb (C)" },
      { symbol: "r", meaning: "Charge separation", unit: "m" },
    ],
    topic: "electric-field",
    difficulty: "medium",
  },
  {
    title: "Electric field definition",
    expression: "E = F/q₀",
    summary: "Defines field strength as force per positive test charge.",
    explanation:
      "The field direction is the force direction on a positive test charge.",
    example: "A 2 N force on a 1 C positive test charge means E = 2 N/C.",
    whenToUse:
      "Use to find the field from a measured force or the force on a test charge.",
    commonMistake:
      "The test charge is taken positive; a negative charge feels force opposite to E.",
    variables: [
      { symbol: "E", meaning: "Electric field strength", unit: "N/C" },
      { symbol: "F", meaning: "Force on test charge", unit: "N" },
      { symbol: "q₀", meaning: "Test charge", unit: "C" },
    ],
    topic: "electric-field",
  },
  {
    title: "Field of a point charge",
    expression: "E = k|Q|/r²",
    summary: "Finds the field magnitude produced by a point charge.",
    explanation:
      "The field is radial: outward for positive Q and inward for negative Q.",
    example:
      "At twice the distance from Q, the field magnitude is one quarter as large.",
    whenToUse:
      "Use for a point charge or a spherical charge distribution outside it.",
    commonMistake:
      "Use the source charge Q here; the test charge is not part of this field formula.",
    variables: [
      { symbol: "E", meaning: "Field magnitude", unit: "N/C" },
      { symbol: "k", meaning: "Coulomb constant", unit: "N·m²/C²" },
      { symbol: "Q", meaning: "Source charge", unit: "C" },
      { symbol: "r", meaning: "Distance from charge", unit: "m" },
    ],
    topic: "electric-field",
  },
  {
    title: "Electric potential",
    expression: "V = U/q",
    summary: "Measures potential energy per unit charge.",
    explanation:
      "Potential is a scalar and its reference level can be chosen for convenience.",
    example: "A 6 J energy change for 2 C corresponds to 3 V.",
    whenToUse:
      "Use to relate a charge’s potential energy change to its potential difference.",
    commonMistake:
      "Potential is energy per charge; do not confuse it with electric field.",
    variables: [
      { symbol: "V", meaning: "Electric potential", unit: "volt (V)" },
      { symbol: "U", meaning: "Electric potential energy", unit: "joule (J)" },
      { symbol: "q", meaning: "Charge", unit: "coulomb (C)" },
    ],
    topic: "electric-potential",
  },
  {
    title: "Potential of a point charge",
    expression: "V = kQ/r",
    summary: "Gives potential relative to infinity for a point charge.",
    explanation:
      "Potential keeps the sign of Q and falls inversely with distance.",
    example: "Doubling distance halves the magnitude of the potential.",
    whenToUse:
      "Use for a point charge or spherical charge distribution outside it.",
    commonMistake:
      "Potential is signed and proportional to 1/r, while field magnitude varies as 1/r².",
    variables: [
      { symbol: "V", meaning: "Electric potential", unit: "volt (V)" },
      { symbol: "k", meaning: "Coulomb constant", unit: "N·m²/C²" },
      { symbol: "Q", meaning: "Source charge", unit: "C" },
      { symbol: "r", meaning: "Distance from charge", unit: "m" },
    ],
    topic: "electric-potential",
  },
  {
    title: "Potential energy of two charges",
    expression: "U = kq₁q₂/r",
    summary: "Finds the interaction energy of two point charges.",
    explanation:
      "With zero energy at infinite separation, like charges have positive interaction energy.",
    example:
      "Opposite-sign charges have negative U under this reference choice.",
    whenToUse: "Use for a pair of point charges separated by distance r.",
    commonMistake:
      "Keep the signs of both charges; unlike charges produce negative energy.",
    variables: [
      {
        symbol: "U",
        meaning: "Interaction potential energy",
        unit: "joule (J)",
      },
      { symbol: "q₁, q₂", meaning: "Point charges", unit: "coulomb (C)" },
      { symbol: "r", meaning: "Separation", unit: "m" },
      { symbol: "k", meaning: "Coulomb constant", unit: "N·m²/C²" },
    ],
    topic: "electric-potential",
  },
  {
    title: "Uniform electric field and potential",
    expression: "ΔV = −E d",
    summary: "Relates potential change to displacement along a uniform field.",
    explanation: "Potential decreases in the direction of the electric field.",
    example: "Moving 0.5 m along a 4 N/C field changes potential by −2 V.",
    whenToUse:
      "Use for displacement parallel to a uniform field; use the field component along displacement otherwise.",
    commonMistake:
      "The minus sign means potential falls along the field direction.",
    variables: [
      { symbol: "ΔV", meaning: "Potential difference", unit: "volt (V)" },
      { symbol: "E", meaning: "Uniform field component", unit: "N/C" },
      { symbol: "d", meaning: "Displacement along field", unit: "m" },
    ],
    topic: "electric-potential",
  },
];

const chapterSubjects: Record<string, string> = {
  "quadratic-equations": "mathematics",
  trigonometry: "mathematics",
  "current-electricity": "physics",
  electrostatics: "physics",
};
const classForSubject: Record<string, string[]> = {
  mathematics: ["class-10"],
  physics: ["class-12"],
};

function mappings(topicId: string) {
  const chapterId = topics.find((topic) => topic.id === topicId)!.chapterId;
  const subjectId = chapterSubjects[chapterId];
  return {
    classes: classForSubject[subjectId],
    exams: ["jee-main"],
    subjects: [subjectId],
    chapters: [chapterId],
    topics: [topicId],
    boards: ["cbse"],
    streams: subjectId === "physics" ? ["science"] : [],
  };
}

const formulas: ContentItem[] = formulaSeeds.flatMap((seed, index) => {
  if ([10, 12, 19, 31].includes(index)) return [];
  const id = `formula-${String(index + 1).padStart(2, "0")}`;
  const mapping = mappings(seed.topic);
  return [
    {
      id,
      ...mapping,
      type: "formula" as const,
      title: seed.title,
      slug: seed.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      formula: seed.expression,
      summary: seed.summary,
      body: [{ heading: "Key idea", bullets: [seed.explanation] }],
      explanation: seed.explanation,
      example: seed.example,
      whenToUse: seed.whenToUse,
      commonMistake: seed.commonMistake,
      variables: seed.variables,
      units: seed.units ?? [],
      keywords: [seed.title.toLowerCase(), seed.topic.replaceAll("-", " ")],
      tags: [seed.topic.replaceAll("-", " ")],
      difficulty: seed.difficulty ?? "easy",
      importance: seed.importance ?? 4,
      relatedIds: [],
    },
  ];
});
for (const formula of formulas) {
  formula.relatedIds = formulas
    .filter(
      (candidate) =>
        candidate.id !== formula.id &&
        candidate.chapters[0] === formula.chapters[0],
    )
    .slice(0, 2)
    .map((candidate) => candidate.id);
}

const noteSeeds = [
  {
    title: "Choosing a method for quadratic equations",
    topic: "quadratic-roots",
    summary:
      "Select factoring, completing the square, or the quadratic formula based on the coefficients and what the question asks.",
    bullets: [
      "First check whether a common factor can be removed.",
      "Try integer factor pairs when the coefficients are small.",
      "Use the discriminant to classify roots before solving if only their nature is requested.",
      "The quadratic formula works even when the roots are irrational or complex.",
    ],
    refs: ["formula-01", "formula-02"],
  },
  {
    title: "Reading the discriminant",
    topic: "quadratic-roots",
    summary:
      "The discriminant controls the number and type of roots of a real quadratic.",
    bullets: [
      "D > 0 gives two distinct real roots.",
      "D = 0 gives one repeated real root.",
      "D < 0 gives a complex conjugate pair and no real roots.",
      "For rational coefficients, a nonnegative perfect-square D gives rational roots.",
    ],
    refs: ["formula-01", "formula-02"],
  },
  {
    title: "Vieta relations at a glance",
    topic: "quadratic-relations",
    summary:
      "Root sums and products let you work with α and β without solving for them individually.",
    bullets: [
      "For ax² + bx + c = 0, α + β = −b/a.",
      "The product is αβ = c/a.",
      "For a monic equation with known roots, use x² − (sum)x + product = 0.",
      "Compute symmetric expressions using the sum and product before finding individual roots.",
    ],
    refs: ["formula-03", "formula-04"],
  },
  {
    title: "Angle addition identities",
    topic: "trig-identities",
    summary:
      "Addition identities expand a combined angle into products of ratios of its component angles.",
    bullets: [
      "Sine of a sum has two positive cross terms.",
      "Cosine of a sum subtracts the sine product.",
      "Tangent of a sum has a denominator 1 − tan A tan B.",
      "Check that denominators are nonzero before using tangent forms.",
    ],
    refs: ["formula-09", "formula-10", "formula-12"],
  },
  {
    title: "Double-angle identities",
    topic: "trig-identities",
    summary:
      "Double-angle formulas are addition formulas with both angles set equal.",
    bullets: [
      "sin 2A = 2 sin A cos A.",
      "Use the sine identity when both ratios are known.",
      "tan 2A can be found directly from tan A.",
      "tan 2A is undefined when 1 − tan²A is zero.",
    ],
    refs: ["formula-12", "formula-14"],
  },
  {
    title: "Using the Pythagorean identity",
    topic: "trig-identities",
    summary:
      "The fundamental identity converts between sine and cosine squares for the same angle.",
    bullets: [
      "Start from sin²A + cos²A = 1.",
      "A known sine gives two possible cosine signs until the angle quadrant is known.",
      "Use the identity to simplify expressions with paired squares.",
      "Do not take a square root without considering both signs where appropriate.",
    ],
    refs: ["formula-15", "formula-12", "formula-14"],
  },
  {
    title: "Choosing a triangle ratio",
    topic: "trig-ratios",
    summary:
      "Match the known sides to the ratio that contains them, with each side identified relative to the chosen angle.",
    bullets: [
      "Sine uses opposite and hypotenuse.",
      "Cosine uses adjacent and hypotenuse.",
      "Tangent uses opposite and adjacent.",
      "The hypotenuse is always opposite the right angle.",
    ],
    refs: ["formula-16", "formula-19", "formula-18"],
  },
  {
    title: "Sine rule and cosine rule",
    topic: "trig-ratios",
    summary:
      "These rules solve non-right triangles when right-triangle ratios alone are insufficient.",
    bullets: [
      "Use the sine rule when an opposite side-angle pair is known.",
      "Use the cosine rule with two sides and their included angle.",
      "Match lowercase side a to uppercase opposite angle A.",
      "Check whether the given data can determine a unique triangle.",
    ],
    refs: ["formula-17", "formula-18"],
  },
  {
    title: "Applying Ohm’s law",
    topic: "circuit-current",
    summary:
      "For an ohmic component under unchanged physical conditions, voltage and current are proportional.",
    bullets: [
      "Use V = IR for the component whose resistance is specified.",
      "Convert milliampere and kilo-ohm values before calculating.",
      "A V-I graph for an ohmic conductor is linear through the origin.",
      "Non-ohmic components do not have constant resistance across operating conditions.",
    ],
    refs: ["formula-21", "formula-25"],
  },
  {
    title: "Combining resistors",
    topic: "circuit-networks",
    summary:
      "Reduce series and parallel groups before applying circuit-wide voltage or current relations.",
    bullets: [
      "Series components share current and their resistances add.",
      "Parallel components share voltage and their reciprocal resistances add.",
      "For two equal parallel resistors, the equivalent resistance is half either one.",
      "The equivalent parallel resistance is smaller than every branch resistance.",
    ],
    refs: ["formula-23", "formula-24", "formula-21"],
  },
  {
    title: "Field, potential, and energy",
    topic: "electric-field",
    summary:
      "Electric field is a vector; electric potential and potential energy are scalars.",
    bullets: [
      "Use Coulomb’s law for force between point charges.",
      "Field points in the direction a positive test charge would accelerate.",
      "Potential due to a point charge retains the source charge sign.",
      "Potential energy includes the signs of both interacting charges.",
    ],
    refs: [
      "formula-26",
      "formula-27",
      "formula-28",
      "formula-29",
      "formula-30",
      "formula-31",
    ],
  },
];

const notes: ContentItem[] = noteSeeds.map((note, index) => {
  const id = `note-${String(index + 1).padStart(2, "0")}`;
  const mapping = mappings(note.topic);
  const topic = topics.find((item) => item.id === note.topic)!;
  return {
    id,
    ...mapping,
    type: "short_note",
    title: note.title,
    slug: note.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    formula: "",
    summary: note.summary,
    body: [{ heading: "Revision points", bullets: note.bullets }],
    explanation: note.summary,
    example: "",
    whenToUse: `Review while studying ${topic.name}.`,
    commonMistake: "Check the conditions and signs before substituting values.",
    variables: [],
    units: [],
    keywords: [topic.name.toLowerCase(), "revision", "short note"],
    tags: [topic.name.toLowerCase(), "revision"],
    difficulty: "medium",
    importance: 4,
    relatedIds: note.refs,
  };
});

const questionSeeds: {
  topic: string;
  prompt: string;
  options: [string, string, string, string];
  answer: number;
  explanation: string;
  formula: string;
  difficulty?: Question["difficulty"];
}[] = [
  {
    topic: "quadratic-roots",
    prompt: "What is the discriminant of x² − 5x + 6 = 0?",
    options: ["1", "−1", "25", "24"],
    answer: 0,
    explanation: "D = b² − 4ac = 25 − 24 = 1.",
    formula: "formula-02",
  },
  {
    topic: "quadratic-relations",
    prompt: "For 2x² − 7x + 3 = 0, what is the sum of the roots?",
    options: ["−7/2", "7/2", "3/2", "−3/2"],
    answer: 1,
    explanation: "The sum is −b/a = −(−7)/2 = 7/2.",
    formula: "formula-03",
  },
  {
    topic: "quadratic-relations",
    prompt: "For 3x² + 2x − 8 = 0, what is the product of the roots?",
    options: ["2/3", "−2/3", "−8/3", "8/3"],
    answer: 2,
    explanation: "The product is c/a = −8/3.",
    formula: "formula-04",
  },
  {
    topic: "quadratic-roots",
    prompt: "What are the roots of x² − 9 = 0?",
    options: ["9 and 0", "3 and 3", "−3 and 3", "−9 and 9"],
    answer: 2,
    explanation: "x² − 9 = (x − 3)(x + 3), so x = ±3.",
    formula: "formula-01",
  },
  {
    topic: "quadratic-roots",
    prompt: "What is the x-coordinate of the vertex of y = x² − 6x + 5?",
    options: ["−3", "3", "6", "−6"],
    answer: 1,
    explanation: "xᵥ = −b/(2a) = 6/2 = 3.",
    formula: "formula-05",
  },
  {
    topic: "quadratic-roots",
    prompt: "Which expression equals x² + 10x + 25?",
    options: ["(x + 5)²", "(x − 5)²", "(x + 25)²", "(x + 10)²"],
    answer: 0,
    explanation: "The middle term is 2·5·x and the constant is 5².",
    formula: "formula-06",
  },
  {
    topic: "quadratic-roots",
    prompt: "If a quadratic has D < 0, how many real roots does it have?",
    options: [
      "Two distinct",
      "One repeated",
      "No real roots",
      "Exactly one real root",
    ],
    answer: 2,
    explanation:
      "A negative discriminant gives a complex conjugate pair and no real roots.",
    formula: "formula-02",
  },
  {
    topic: "quadratic-relations",
    prompt: "A monic quadratic has roots 2 and 5. Which is its equation?",
    options: [
      "x² + 7x + 10 = 0",
      "x² − 7x + 10 = 0",
      "x² − 3x + 10 = 0",
      "x² + 3x − 10 = 0",
    ],
    answer: 1,
    explanation: "Use x² − (sum)x + product = 0: x² − 7x + 10 = 0.",
    formula: "formula-08",
  },
  {
    topic: "trig-identities",
    prompt: "What is sin(30° + 60°)?",
    options: ["0", "1/2", "√3/2", "1"],
    answer: 3,
    explanation: "30° + 60° = 90° and sin 90° = 1.",
    formula: "formula-09",
  },
  {
    topic: "trig-identities",
    prompt: "What is cos 60°?",
    options: ["1/2", "√3/2", "1", "0"],
    answer: 0,
    explanation: "The standard exact value is cos 60° = 1/2.",
    formula: "formula-10",
  },
  {
    topic: "trig-identities",
    prompt: "If sin A = 3/5 and A is acute, what is cos A?",
    options: ["3/4", "4/5", "5/4", "−4/5"],
    answer: 1,
    explanation:
      "sin²A + cos²A = 1; acute A makes cosine positive, giving 4/5.",
    formula: "formula-15",
  },
  {
    topic: "trig-identities",
    prompt: "If tan A = 1/2, what is tan 2A?",
    options: ["1/3", "4/3", "3/4", "1"],
    answer: 1,
    explanation: "tan 2A = 2(1/2)/(1 − 1/4) = 1/(3/4) = 4/3.",
    formula: "formula-14",
  },
  {
    topic: "trig-identities",
    prompt: "Which identity is correct?",
    options: [
      "sin 2A = sin²A + cos²A",
      "sin 2A = 2 sin A cos A",
      "sin 2A = 2 sin A",
      "sin 2A = sin A cos A",
    ],
    answer: 1,
    explanation: "The sine double-angle identity is sin 2A = 2 sin A cos A.",
    formula: "formula-12",
  },
  {
    topic: "trig-ratios",
    prompt: "In a right triangle, sin A equals which ratio?",
    options: [
      "Adjacent/hypotenuse",
      "Opposite/adjacent",
      "Opposite/hypotenuse",
      "Hypotenuse/opposite",
    ],
    answer: 2,
    explanation: "SOH: sine is opposite divided by hypotenuse.",
    formula: "formula-19",
  },
  {
    topic: "trig-ratios",
    prompt:
      "In a 3-4-5 right triangle, the opposite side to A is 3. What is tan A?",
    options: ["3/5", "4/5", "3/4", "4/3"],
    answer: 2,
    explanation: "Tangent is opposite/adjacent = 3/4.",
    formula: "formula-16",
  },
  {
    topic: "trig-ratios",
    prompt: "In the sine rule, side a is paired with which angle?",
    options: ["A", "B", "C", "The right angle only"],
    answer: 0,
    explanation:
      "Each lowercase side is opposite the matching uppercase angle.",
    formula: "formula-17",
  },
  {
    topic: "trig-ratios",
    prompt:
      "Two sides are 5 and 5, with included angle 60°. What is the third side?",
    options: ["5√2", "5", "10", "√5"],
    answer: 1,
    explanation:
      "By the cosine rule, c² = 25 + 25 − 50 cos 60° = 25, so c = 5.",
    formula: "formula-18",
  },
  {
    topic: "trig-identities",
    prompt:
      "What is the sign between cos A cos B and sin A sin B in cos(A + B)?",
    options: ["Plus", "Minus", "Multiplication only", "No sine term"],
    answer: 1,
    explanation: "cos(A + B) = cos A cos B − sin A sin B.",
    formula: "formula-10",
  },
  {
    topic: "circuit-current",
    prompt: "A 4 Ω resistor carries 2 A. What is the voltage across it?",
    options: ["2 V", "6 V", "8 V", "16 V"],
    answer: 2,
    explanation: "Ohm’s law gives V = IR = 2 × 4 = 8 V.",
    formula: "formula-21",
  },
  {
    topic: "circuit-current",
    prompt:
      "A uniform wire’s length doubles while its area and material stay fixed. What happens to R?",
    options: [
      "It halves",
      "It doubles",
      "It is unchanged",
      "It becomes four times larger",
    ],
    answer: 1,
    explanation: "R = ρL/A, so doubling L doubles resistance.",
    formula: "formula-22",
  },
  {
    topic: "circuit-networks",
    prompt: "What is the equivalent resistance of 2 Ω and 3 Ω in series?",
    options: ["1.2 Ω", "5 Ω", "6 Ω", "2.5 Ω"],
    answer: 1,
    explanation: "Series resistances add: 2 + 3 = 5 Ω.",
    formula: "formula-23",
  },
  {
    topic: "circuit-networks",
    prompt:
      "Two 6 Ω resistors are connected in parallel. What is their equivalent resistance?",
    options: ["12 Ω", "6 Ω", "3 Ω", "1.5 Ω"],
    answer: 2,
    explanation: "1/R = 1/6 + 1/6 = 1/3, so R = 3 Ω.",
    formula: "formula-24",
  },
  {
    topic: "circuit-current",
    prompt:
      "A 2 A current flows through a 5 Ω resistor. How much power is dissipated?",
    options: ["10 W", "20 W", "25 W", "50 W"],
    answer: 1,
    explanation: "P = I²R = 2² × 5 = 20 W.",
    formula: "formula-25",
  },
  {
    topic: "circuit-current",
    prompt: "Which quantity has the SI unit ohm (Ω)?",
    options: ["Current", "Potential difference", "Resistance", "Power"],
    answer: 2,
    explanation: "Resistance is measured in ohms.",
    formula: "formula-21",
  },
  {
    topic: "electric-field",
    prompt:
      "Two point charges are moved to twice their original separation. How does force magnitude change?",
    options: [
      "Doubles",
      "Halves",
      "Becomes one quarter",
      "Becomes four times larger",
    ],
    answer: 2,
    explanation:
      "Coulomb force varies as 1/r², so doubling r gives one quarter the force.",
    formula: "formula-26",
    difficulty: "medium",
  },
  {
    topic: "electric-field",
    prompt:
      "The electric field direction at a point is defined as the direction of force on what?",
    options: [
      "A negative test charge",
      "A positive test charge",
      "Any source charge",
      "A magnetic pole",
    ],
    answer: 1,
    explanation: "By definition E = F/q₀ for a positive test charge.",
    formula: "formula-27",
  },
  {
    topic: "electric-field",
    prompt:
      "The field due to a positive point charge points in which direction?",
    options: [
      "Radially outward",
      "Radially inward",
      "Along a circle",
      "It has no direction",
    ],
    answer: 0,
    explanation:
      "A positive source repels a positive test charge, so its field points outward.",
    formula: "formula-28",
  },
  {
    topic: "electric-potential",
    prompt:
      "A 6 J energy change corresponds to 2 C of charge. What is the potential difference?",
    options: ["2 V", "3 V", "8 V", "12 V"],
    answer: 1,
    explanation: "V = U/q = 6/2 = 3 V.",
    formula: "formula-29",
  },
  {
    topic: "electric-potential",
    prompt:
      "For a positive point charge, what happens to potential when distance doubles?",
    options: [
      "It doubles",
      "It halves",
      "It becomes one quarter",
      "It is unchanged",
    ],
    answer: 1,
    explanation: "Point-charge potential varies as 1/r, so it halves.",
    formula: "formula-30",
  },
  {
    topic: "electric-potential",
    prompt:
      "With zero potential energy at infinity, what sign is the energy of two unlike point charges?",
    options: [
      "Positive",
      "Negative",
      "Always zero",
      "Cannot be determined without distance",
    ],
    answer: 1,
    explanation:
      "U = kq₁q₂/r is negative when the charges have opposite signs.",
    formula: "formula-31",
    difficulty: "medium",
  },
  {
    topic: "electric-potential",
    prompt:
      "As you move in the direction of a uniform electric field, electric potential generally:",
    options: [
      "Increases",
      "Decreases",
      "Stays constant",
      "Changes sign every metre",
    ],
    answer: 1,
    explanation: "ΔV = −E·d, so potential decreases along the field.",
    formula: "formula-32",
  },
];

const questions: Question[] = questionSeeds
  .filter((_, index) => ![5, 6, 7, 15, 16, 17, 30].includes(index))
  .map((seed, index) => ({
    id: `question-${String(index + 1).padStart(2, "0")}`,
    ...mappings(seed.topic),
    question: seed.prompt,
    options: seed.options,
    correctAnswer: seed.answer,
    explanation: seed.explanation,
    linkedContentIds: [seed.formula],
    difficulty: seed.difficulty ?? "easy",
  }));

const mathChapterIds = ["quadratic-equations", "trigonometry"];
const physicsChapterIds = ["current-electricity", "electrostatics"];
const byTopics = (ids: string[]) =>
  formulas
    .filter((item) => ids.includes(item.topics[0]))
    .map((item) => item.id);
const sheets = [
  {
    id: "sheet-class-10-mathematics",
    title: "Class 10 Mathematics Quick Sheet",
    description:
      "Quadratic equation and trigonometry formulas for Class 10 revision.",
    classes: ["class-10"],
    exams: [],
    subjects: ["mathematics"],
    chapters: mathChapterIds,
    topics: [],
    boards: ["cbse"],
    streams: [],
    contentIds: byTopics([
      "quadratic-roots",
      "quadratic-relations",
      "trig-identities",
      "trig-ratios",
    ]),
  },
  {
    id: "sheet-class-12-current-electricity",
    title: "Class 12 Current Electricity Sheet",
    description: "Core current, resistance, network, and power relations.",
    classes: ["class-12"],
    exams: [],
    subjects: ["physics"],
    chapters: ["current-electricity"],
    topics: [],
    boards: ["cbse"],
    streams: ["science"],
    contentIds: byTopics(["circuit-current", "circuit-networks"]),
  },
  {
    id: "sheet-jee-main-physics",
    title: "JEE Main Physics Quick Formula Sheet",
    description:
      "Current electricity and electrostatics relations for JEE Main practice.",
    classes: [],
    exams: ["jee-main"],
    subjects: ["physics"],
    chapters: physicsChapterIds,
    topics: [],
    boards: [],
    streams: [],
    contentIds: byTopics([
      "circuit-current",
      "circuit-networks",
      "electric-field",
      "electric-potential",
    ]),
  },
];

export const sampleData: Dataset = {
  version: 1,
  classes,
  exams,
  boards,
  streams,
  subjects,
  chapters,
  topics,
  content: [...formulas, ...notes],
  questions,
  sheets,
};
