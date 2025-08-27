# Saudi Riyal Font Setup - Global Implementation

## Font File Required
To use the custom Saudi Riyal symbol across the entire website, you need to add the font file to this directory:

**File name:** `saudiriyalsymbol.ttf`
**Location:** `/public/fonts/saudiriyalsymbol.ttf`

## Font Details
- **Font Family:** `SaudiRiyalSymbol`
- **Unicode Character:** `&#xea;` (decimal: 234)
- **Format:** TrueType (.ttf)

## Global Implementation
The Saudi Riyal font is now implemented globally across the entire website:

### 1. CSS Classes Available
- `.riyal-symbol` - Standard size
- `.riyal-symbol-sm` - Small size (0.875em)
- `.riyal-symbol-lg` - Large size (1.25em)
- `.riyal-symbol-xl` - Extra large size (1.5em)
- `.currency-riyal` - Base font family only

### 2. React Component
Import and use the `SaudiRiyal` component anywhere in your project:

```jsx
import SaudiRiyal from "@/components/ui/SaudiRiyal";

// Basic usage
<SaudiRiyal amount={123.45} />

// With size variants
<SaudiRiyal amount={599.00} size="lg" />
<SaudiRiyal amount={99.99} size="sm" />
<SaudiRiyal amount={1999.99} size="xl" />

// With custom styling
<SaudiRiyal amount={299.99} className="text-green-600 font-bold" />

// Without symbol (just the amount)
<SaudiRiyal amount={150.00} showSymbol={false} />
```

### 3. Import Options
```jsx
// Option 1: Direct import
import SaudiRiyal from "@/components/ui/SaudiRiyal";

// Option 2: From utils (re-exported)
import { SaudiRiyal } from "@/lib/utils";
```

## Usage Examples Across Website

### Product Pages
```jsx
<div className="product-price">
  <SaudiRiyal amount={product.price} size="lg" />
  {product.originalPrice && (
    <span className="line-through ml-2">
      <SaudiRiyal amount={product.originalPrice} size="sm" />
    </span>
  )}
</div>
```

### Admin Dashboard
```jsx
<div className="stats-card">
  <h4>Today's Revenue</h4>
  <div className="text-2xl font-bold">
    <SaudiRiyal amount={dailyRevenue} size="xl" />
  </div>
</div>
```

### Shopping Cart
```jsx
<div className="cart-total">
  <span>Total:</span>
  <span><SaudiRiyal amount={cartTotal} size="lg" /></span>
</div>
```

## How It Works
1. **Font Loading:** The font is loaded via `@font-face` in `app/globals.css`
2. **CSS Classes:** Multiple size variants are available via CSS classes
3. **React Component:** The `SaudiRiyal` component handles formatting and display
4. **Global Availability:** Can be imported and used in any component across the website

## Testing
- Visit `/fonts/test-font.html` to test if the font is working correctly
- Check the examples in `components/ui/SaudiRiyal-examples.tsx` for reference

## Fallback
If the custom font is not loaded, the browser will fall back to Arial and display a standard character.

## File Structure
```
components/ui/
├── SaudiRiyal.tsx          # Main component
├── SaudiRiyal-examples.tsx # Usage examples
└── ...

public/fonts/
├── saudiriyalsymbol.ttf    # Font file (add this)
├── test-font.html          # Font test page
└── README.md               # This file

app/
└── globals.css             # Global font declarations
```
