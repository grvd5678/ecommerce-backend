import 'dotenv/config';
import { Product } from './models/AdvancedProduct.js';
import Category from './models/Category.js';
import connectDB from './config/db.js';

const seedData = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Category.deleteMany({});

    // 20 high-quality, realistic e-commerce products grouped by Category and Subcategory
    const catalog = [
      // 1. Electronics -> Mobile Phones
      {
        parent: "Electronics",
        sub: "Mobile Phones",
        name: "iPhone 15 Pro Max 256GB Titanium",
        description: "Powered by the groundbreaking A17 Pro chip with aerospace-grade titanium design and pro camera system.",
        basePrice: 134900,
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80",
        rating: 4.9,
      },
      // 2. Electronics -> Mobile Phones
      {
        parent: "Electronics",
        sub: "Mobile Phones",
        name: "Samsung Galaxy S24 Ultra AI",
        description: "Experience the next era of mobile AI with Galaxy AI, titanium frame, and built-in S Pen.",
        basePrice: 129999,
        image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80",
        rating: 4.8,
      },
      // 3. Electronics -> Audio
      {
        parent: "Electronics",
        sub: "Audio",
        name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
        description: "Industry-leading noise cancellation with Auto NC Optimizer, 30-hour battery life, and ultra-clear hands-free calling.",
        basePrice: 26990,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
        rating: 4.9,
      },
      // 4. Electronics -> Audio
      {
        parent: "Electronics",
        sub: "Audio",
        name: "Apple HomePod Mini Smart Speaker",
        description: "Room-filling sound with intelligent Siri assistant and seamless smart home integration.",
        basePrice: 9900,
        image: "https://res.cloudinary.com/xsht28yi/image/upload/v1783870692/Apple_Home_Pod_w0vfpv.jpg",
        rating: 4.6,
      },
      // 5. Electronics -> Wearables
      {
        parent: "Electronics",
        sub: "Wearables",
        name: "Apple Watch Series 9 GPS 45mm",
        description: "Powerful S9 SiP processor with Double Tap gesture, brighter display, and comprehensive health sensors.",
        basePrice: 41900,
        image: "https://res.cloudinary.com/xsht28yi/image/upload/v1783870552/Apple_Watch_Series_11_go6y2q.png",
        rating: 4.7,
      },
      // 6. Electronics -> Wearables
      {
        parent: "Electronics",
        sub: "Wearables",
        name: "Samsung Galaxy Watch 6 Classic",
        description: "Iconic rotating bezel with sapphire crystal glass, sleep coaching, and advanced fitness tracking.",
        basePrice: 33999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
        rating: 4.6,
      },
      // 7. Electronics -> Laptops
      {
        parent: "Electronics",
        sub: "Laptops",
        name: "MacBook Air 15-inch M3 Chip",
        description: "Strikingly thin design with up to 18 hours of battery life, Liquid Retina display, and MagSafe 3.",
        basePrice: 134900,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
        rating: 4.9,
      },

      // 8. Fashion -> Men's
      {
        parent: "Fashion",
        sub: "Men's",
        name: "Men's Regular Fit Italian Wool 2-Piece Suit",
        description: "Tailored to perfection with premium breathable wool blend and classic notch lapel styling.",
        basePrice: 8999,
        image: "https://res.cloudinary.com/xsht28yi/image/upload/v1783871477/Men_Regular_Fit_2-Piece_Suit_Set_k8m6fg.avif",
        rating: 4.7,
      },
      // 9. Fashion -> Men's
      {
        parent: "Fashion",
        sub: "Men's",
        name: "Slim Fit Oxford Cotton Casual Shirt",
        description: "Crafted from 100% combed cotton with button-down collar for all-day comfort.",
        basePrice: 1899,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
        rating: 4.5,
      },
      // 10. Fashion -> Women's
      {
        parent: "Fashion",
        sub: "Women's",
        name: "Shein Off-Shoulder Overlay Bardot Top",
        description: "Chic and lightweight evening top with elegant overlay detail and ruffled sleeves.",
        basePrice: 1499,
        image: "https://res.cloudinary.com/xsht28yi/image/upload/v1783871480/Shein_Off_Shoulder_Full_Sleeve_Overlay_Detail_Bardot_Top_g9dhcd.avif",
        rating: 4.6,
      },
      // 11. Fashion -> Women's
      {
        parent: "Fashion",
        sub: "Women's",
        name: "Floral Wrap Midi Dress with Belt",
        description: "Flowy georgette summer dress with romantic floral prints and adjustable waist tie.",
        basePrice: 2499,
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
        rating: 4.8,
      },

      // 12. Home & Kitchen -> Furniture
      {
        parent: "Home & Kitchen",
        sub: "Furniture",
        name: "Shoji Solid Wood Bedside Table with Drawer",
        description: "Minimalist Japanese-inspired nightstand with smooth gliding drawer and natural walnut finish.",
        basePrice: 4299,
        image: "https://res.cloudinary.com/xsht28yi/image/upload/v1783870976/Shoji_Bedside_Table_Drawer_Brown_zf0vbd.jpg",
        rating: 4.7,
      },
      // 13. Home & Kitchen -> Appliances
      {
        parent: "Home & Kitchen",
        sub: "Appliances",
        name: "WONDERCHEF Stainless Steel Toaster Griller Oven 28L",
        description: "Multi-function OTG for baking, grilling, and toasting with auto-shut off and heat control.",
        basePrice: 6499,
        image: "https://res.cloudinary.com/xsht28yi/image/upload/v1783871052/WONDERCHEF_Stainless_Steel_Toaster_Griller_Oven_28L_klujck.jpg",
        rating: 4.6,
      },
      // 14. Home & Kitchen -> Appliances
      {
        parent: "Home & Kitchen",
        sub: "Appliances",
        name: "Espresso Maker & Milk Frother Machine",
        description: "15-bar Italian pump espresso machine for café-quality cappuccino and latte at home.",
        basePrice: 8999,
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&q=80",
        rating: 4.7,
      },
      // 15. Home & Kitchen -> Decor
      {
        parent: "Home & Kitchen",
        sub: "Decor",
        name: "Smålom LED Pillar Battery Operated Candles (Set of 3)",
        description: "Warm flickering LED candlelight set with realistic wax texture and remote timer.",
        basePrice: 999,
        image: "https://res.cloudinary.com/xsht28yi/image/upload/v1783871146/smalom-led-pillar-candle-battery-operated-white__1553779_pe1023727_s5_vbmdjz.avif",
        rating: 4.5,
      },

      // 16. Sports -> Training
      {
        parent: "Sports",
        sub: "Training",
        name: "Men's Mid-Top Pro Running Sports Shoes",
        description: "Engineered mesh upper with responsive foam cushioning and high-grip rubber outsole.",
        basePrice: 3299,
        image: "https://res.cloudinary.com/xsht28yi/image/upload/v1783871570/Men_Mid-Top_Running_Sports_Shoes_with_Lace_Fastening_qntulz.avif",
        rating: 4.8,
      },
      // 17. Sports -> Training
      {
        parent: "Sports",
        sub: "Training",
        name: "Adjustable Cast Iron Dumbbells Set (20kg)",
        description: "Versatile weight training set with non-slip grips and spinlock collars for home gyms.",
        basePrice: 4499,
        image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80",
        rating: 4.7,
      },

      // 18. Accessories -> Travel
      {
        parent: "Accessories",
        sub: "Travel",
        name: "Ergonomic Memory Foam U-Shape Travel Neck Pillow",
        description: "360-degree head and neck support with breathable washable velour cover and eye mask.",
        basePrice: 799,
        image: "https://res.cloudinary.com/xsht28yi/image/upload/v1783871733/u-shape-black-neck-pillow-travelling-headrest-neck-pillow-eye-original_o22tot.webp",
        rating: 4.6,
      },
      // 19. Accessories -> Lifestyle
      {
        parent: "Accessories",
        sub: "Lifestyle",
        name: "The Body Shop Shea Nourishing Body Mist (100ml)",
        description: "Subtle, warm, and nutty scent made with 97% natural origin ingredients for all-day freshness.",
        basePrice: 1195,
        image: "https://res.cloudinary.com/xsht28yi/image/upload/v1783871833/THE_BODY_SHOP_Shea_Body_Mist_-_100ml_mekeop.jpg",
        rating: 4.7,
      },
      // 20. Accessories -> Lifestyle
      {
        parent: "Accessories",
        sub: "Lifestyle",
        name: "Polarized UV400 Aviator Sunglasses",
        description: "Classic metal frame with anti-glare polarized lenses providing 100% UV400 protection.",
        basePrice: 1599,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
        rating: 4.6,
      },
    ];

    // Cache categories to avoid duplicate DB calls
    const parentCategoryCache = {};
    const subCategoryCache = {};

    let count = 0;
    for (const item of catalog) {
      // Find or create parent category
      if (!parentCategoryCache[item.parent]) {
        let parentCat = await Category.findOne({ name: item.parent, parent: null });
        if (!parentCat) {
          parentCat = await Category.create({ name: item.parent, parent: null });
        }
        parentCategoryCache[item.parent] = parentCat;
      }

      // Find or create subcategory
      const subKey = `${item.parent}:${item.sub}`;
      if (!subCategoryCache[subKey]) {
        let subCat = await Category.findOne({ name: item.sub, parent: parentCategoryCache[item.parent]._id });
        if (!subCat) {
          subCat = await Category.create({ name: item.sub, parent: parentCategoryCache[item.parent]._id });
        }
        subCategoryCache[subKey] = subCat;
      }

      await Product.create({
        name: item.name,
        description: item.description,
        basePrice: item.basePrice,
        category: subCategoryCache[subKey]._id,
        image: item.image,
        averageRating: item.rating,
      });

      count++;
      console.log(`✅ [${count}/20] Seeded product: ${item.name}`);
    }

    console.log(`\n🎉 Seeding complete: Successfully created ${count} products across all categories.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
