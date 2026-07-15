import 'dotenv/config';
import { Product } from './models/AdvancedProduct.js';
import Category from './models/Category.js';
import connectDB from './config/db.js';

const seedData = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Define parents and sub-categories
    const parents = {
      "Electronics": ["Audio", "Wearables", "Mobile Phones"],
      "Home & Kitchen": ["Decor", "Furniture", "Appliances"],
      "Fashion": ["Men's", "Women's"],
      "Sports": ["Training"],
      "Accessories": ["Travel", "Lifestyle"]
    };

    const imageMap = {
      "Mobile Phones": "https://res.cloudinary.com/xsht28yi/image/upload/v1783870298/IPhone_17_Pro_woucia.jpg",
      "Wearables": "https://res.cloudinary.com/xsht28yi/image/upload/v1783870552/Apple_Watch_Series_11_go6y2q.png",
      "Audio": "https://res.cloudinary.com/xsht28yi/image/upload/v1783870692/Apple_Home_Pod_w0vfpv.jpg",
      "Furniture": "https://res.cloudinary.com/xsht28yi/image/upload/v1783870976/Shoji_Bedside_Table_Drawer_Brown_zf0vbd.jpg",
      "Appliances": "https://res.cloudinary.com/xsht28yi/image/upload/v1783871052/WONDERCHEF_Stainless_Steel_Toaster_Griller_Oven_28L_klujck.jpg",
      "Decor": "https://res.cloudinary.com/xsht28yi/image/upload/v1783871146/smalom-led-pillar-candle-battery-operated-white__1553779_pe1023727_s5_vbmdjz.avif",
      "Men's": "https://res.cloudinary.com/xsht28yi/image/upload/v1783871477/Men_Regular_Fit_2-Piece_Suit_Set_k8m6fg.avif",
      "Women's": "https://res.cloudinary.com/xsht28yi/image/upload/v1783871480/Shein_Off_Shoulder_Full_Sleeve_Overlay_Detail_Bardot_Top_g9dhcd.avif",
      "Training": "https://res.cloudinary.com/xsht28yi/image/upload/v1783871570/Men_Mid-Top_Running_Sports_Shoes_with_Lace_Fastening_qntulz.avif",
      "Travel": "https://res.cloudinary.com/xsht28yi/image/upload/v1783871733/u-shape-black-neck-pillow-travelling-headrest-neck-pillow-eye-original_o22tot.webp",
      "Lifestyle": "https://res.cloudinary.com/xsht28yi/image/upload/v1783871833/THE_BODY_SHOP_Shea_Body_Mist_-_100ml_mekeop.jpg"
    };

    for (const [parentName, subs] of Object.entries(parents)) {
      const parentCat = await Category.create({ name: parentName, parent: null });
      
      for (const subName of subs) {
        const subCat = await Category.create({ name: subName, parent: parentCat._id });
        
        // Create EXACTLY 1 product per subcategory
        await Product.create({
          name: `${subName} Featured Item`,
          description: `Detailed description for ${subName}.`,
          basePrice: Math.floor(Math.random() * 5000) + 500,
          category: subCat._id,
          image: imageMap[subName],
          averageRating: 4.5
        });
        console.log(`✅ Created 1 product for ${subName}`);
      }
    }

    console.log("Seeding complete: 11 products created.");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
