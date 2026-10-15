import type { FlowEdgeSpec, FlowNodeSpec, FlowScenario, FlowSpec } from './FlowPlayer'

/*
 * The Sizzle flow as swimlanes, one per area of the app's sitemap: Explore,
 * the recipe, meal plans and the library, and the Me tab's kitchen tools.
 * Home sits at the top of the Explore lane and every path starts from it,
 * except restocking, which picks up where a shopping trip ends.
 */

const sizzleFlowDesc =
  'From Home, a cook either swipes through recommendations or searches, then opens a recipe with its ingredients, ' +
  'steps and feedback. Cooking it now leads through the steps to rating the recipe; otherwise it is saved to the ' +
  'library. The meal plans channel opens a plan with today and all days, and the plan fills the shopping list. ' +
  'From the shopping list the cook opens the fridge, adds food by category, and returns to the fridge.'

const lanes = [
  { label: 'Explore', x0: 20, x1: 250 },
  { label: 'Recipe', x0: 270, x1: 520 },
  { label: 'Meal plans · History', x0: 540, x1: 790 },
  { label: 'Me · Kitchen', x0: 810, x1: 1100 },
]

const nodes: FlowNodeSpec[] = [
  // Explore
  { id: 'open', type: 'terminal', cx: 135, y: 100, w: 160, title: 'Open Sizzle' },
  { id: 'home', type: 'step', x: 45, y: 172, w: 180, title: 'Home', note: 'Channels and swipe picks' },
  { id: 'swipe', type: 'step', x: 37, y: 268, w: 92, title: 'Swipe picks' },
  { id: 'search', type: 'step', x: 141, y: 268, w: 92, title: 'Search' },
  // Recipe
  { id: 'recipe', type: 'step', x: 295, y: 340, title: 'Recipe detail', note: 'Ingredients, steps, feedback' },
  { id: 'cook', type: 'decision', cx: 395, cy: 476, w: 150, h: 80, title: 'Cook it now?' },
  { id: 'steps', type: 'step', x: 295, y: 556, title: 'Follow the steps', note: 'A photo for each step' },
  { id: 'rate', type: 'terminal', cx: 395, y: 640, w: 200, title: 'Rate the recipe', note: 'Feedback for other cooks' },
  // Meal plans · History
  { id: 'plans', type: 'step', x: 565, y: 172, title: 'Meal plans', note: 'Saved, in progress, finished' },
  { id: 'plan', type: 'step', x: 565, y: 268, title: 'Plan detail', note: 'Today and all days' },
  { id: 'saved', type: 'terminal', cx: 665, y: 448, w: 200, title: 'Saved', note: 'Kept apart from plans' },
  // Me · Kitchen
  { id: 'shopping', type: 'step', x: 855, y: 268, title: 'Shopping list', note: 'Plan ingredients added' },
  { id: 'fridge', type: 'step', x: 855, y: 364, title: 'Fridge', note: 'What is on hand' },
  { id: 'categories', type: 'step', x: 855, y: 460, title: 'Choose categories' },
  { id: 'food', type: 'step', x: 855, y: 544, title: 'Choose food' },
  { id: 'added', type: 'terminal', cx: 955, y: 628, w: 200, title: 'Added to fridge' },
]

const edges: FlowEdgeSpec[] = [
  { id: 'open-home', d: 'M135 144 L135 172', to: 'home' },
  { id: 'home-swipe', d: 'M135 228 L135 248 L83 248 L83 268', to: 'swipe' },
  { id: 'home-search', d: 'M135 228 L135 248 L187 248 L187 268', to: 'search' },
  { id: 'swipe-recipe', d: 'M83 312 L83 368 L295 368', to: 'recipe' },
  { id: 'search-recipe', d: 'M187 312 L187 368 L295 368', to: 'recipe' },
  { id: 'home-plans', d: 'M225 200 L565 200', to: 'plans' },
  { id: 'recipe-cook', d: 'M395 396 L395 436', to: 'cook' },
  { id: 'cook-yes', d: 'M395 516 L395 556', to: 'steps', branch: { x: 405, y: 536, text: 'Yes' } },
  { id: 'cook-no', d: 'M470 476 L565 476', to: 'saved', branch: { x: 482, y: 466, text: 'No' } },
  { id: 'steps-rate', d: 'M395 612 L395 640', to: 'rate' },
  { id: 'plans-plan', d: 'M665 228 L665 268', to: 'plan' },
  { id: 'plan-shopping', d: 'M765 296 L855 296', to: 'shopping' },
  { id: 'shopping-fridge', d: 'M955 324 L955 364', to: 'fridge' },
  { id: 'fridge-categories', d: 'M955 420 L955 460', to: 'categories' },
  { id: 'categories-food', d: 'M955 504 L955 544', to: 'food' },
  { id: 'food-added', d: 'M955 588 L955 628', to: 'added' },
]

const scenarios: FlowScenario[] = [
  {
    id: 'cook',
    label: 'Cook something new',
    start: 'open',
    edges: ['open-home', 'home-swipe', 'swipe-recipe', 'recipe-cook', 'cook-yes', 'steps-rate'],
  },
  { id: 'save', label: 'Search and save', start: 'open', edges: ['open-home', 'home-search', 'search-recipe', 'recipe-cook', 'cook-no'] },
  { id: 'plan', label: 'Plan the week', start: 'open', edges: ['open-home', 'home-plans', 'plans-plan', 'plan-shopping'] },
  { id: 'fridge', label: 'Stock the fridge', start: 'shopping', edges: ['shopping-fridge', 'fridge-categories', 'categories-food', 'food-added'] },
]

export const sizzleFlow: FlowSpec = {
  width: 1120,
  height: 780,
  title: 'Sizzle interaction flow',
  desc: sizzleFlowDesc,
  nodes,
  edges,
  scenarios,
  backdrop: (
    <>
      {lanes.map((lane) => (
        <g className="flow-lane" key={lane.label}>
          <text x={(lane.x0 + lane.x1) / 2} y={42}>{lane.label}</text>
          <line x1={lane.x0} y1={56} x2={lane.x1} y2={56} />
        </g>
      ))}
      {[260, 530, 800].map((x) => <line className="flow-divider" key={x} x1={x} y1={28} x2={x} y2={716} />)}
    </>
  ),
  legend: (
    <g className="flow-legend">
      <rect className="flow-legend__screen" x={40} y={743} width={20} height={14} rx={4} />
      <text x={68} y={750}>Screen</text>
      <polygon className="flow-legend__decision" points="160,742 172,750 160,758 148,750" />
      <text x={180} y={750}>Decision</text>
      <rect className="flow-legend__terminal" x={268} y={743} width={24} height={14} rx={7} />
      <text x={300} y={750}>Start or end</text>
    </g>
  ),
}
