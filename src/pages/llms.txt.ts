export async function GET() {
  const content = `# Get Yo Frozen Yogurt Cafe

> Best frozen yogurt near me in New Jersey. Self-serve froyo with 16 main flavors, 90+ toppings, dairy-free options, and kosher certification.

## About
Get Yo Frozen Yogurt Cafe is a premium self-serve frozen yogurt destination in New Jersey. We offer 16 main rotating flavors and 90+ toppings including fresh fruits, candies, nuts, boba, sauces, and specialty items. Our froyo includes No Sugar Added, Non-Fat, Low-Fat, and Dairy-Free options for everyone.

## Locations

### Marlboro Location (Morganville)
- Address: 450 Union Hill Road, Suite 15, Morganville, NJ 07751
- Phone: (732) 617-6332
- Hours: Sun 1-10 PM, Mon-Thu 3-10 PM, Fri-Sat 1-11 PM
- Features: 16 Flavors, Kosher Certified, 8 Self-Serve Machines, 90+ Toppings
- Nearby: Manalapan, Freehold, Old Bridge, East Brunswick, Monroe Township

### New Providence Location
- Address: 12 South Street, New Providence, NJ 07974
- Phone: (908) 219-4338
- Hours: Sun 12-10:30 PM, Mon-Thu 1-9:30 PM, Fri-Sat 12-10:30 PM
- Features: 8 Flavors, Self-Serve

## Menu Highlights
- Frozen Yogurt Flavors: Tahitian Vanilla, Wild Strawberry, Chocolate, Cookies N Cream, Espresso, Mango Sorbet, Watermelon Sorbet, California Tart, Cake Batter, Cookie Monster, Sea Salt Caramel Pretzel, Old Fashioned Peanut Butter, Irish Mint, Vanilla Cream, Banana Bread, Cotton Candy
- Dietary Options: Non-Fat, Low-Fat, No Sugar Added, Dairy-Free Sorbets
- Topping Categories: Fresh Fruits, Chocolates, Cookies & Crumbs, Candies & Gummies, Nuts & Seeds, Cereals, Sauces & Syrups, Boba, Special Items

## Rewards Program - Ounce&Bounce
- Earn 10 points per ounce purchased
- 100 bonus points on signup
- Free 13oz frozen yogurt on your birthday
- Download the Get Yo mobile app for rewards tracking

## Contact
- Email: info@getyocafe.com
- Website: https://frozenyogurtcafe.com
- Instagram: @getyo_marlboro
- TikTok: @getyofrozenyogurtcafe

## Keywords
frozen yogurt near me, froyo near me, ice cream near me, froyo, self serve frozen yogurt, kosher frozen yogurt, dairy free froyo, frozen yogurt marlboro nj, frozen yogurt new providence nj, froyo manalapan, best froyo places near me, dessert near me, froyo nj

URL: https://frozenyogurtcafe.com/
`;

  return new Response(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
