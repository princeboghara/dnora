import pg from 'pg';
const { Pool } = pg;
const connectionString = "postgresql://postgres.zzwgudzlpsfxyxqmywtv:KSXaSRYF3-Zq6hY@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

async function main() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    // Fetch products with their existing images
    const res = await pool.query(`
      SELECT p.id, p.name, p.slug, p.price,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', pi.id,
                   'secure_url', pi.secure_url,
                   'alt_text', pi.alt_text,
                   'sort_order', pi.sort_order
                 ) ORDER BY pi.sort_order ASC
               ) FILTER (WHERE pi.id IS NOT NULL),
               '[]'::json
             ) as images
      FROM public.products p
      LEFT JOIN public.product_images pi ON pi.product_id = p.id
      GROUP BY p.id;
    `);

    console.log(`Setting up color variants for ${res.rows.length} products...`);

    for (const prod of res.rows) {
      const imgs = prod.images || [];
      const img1 = imgs[0]?.secure_url || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85";
      const img2 = imgs[1]?.secure_url || imgs[0]?.secure_url || "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85";

      // Color variant definitions with authentic luxury palettes
      let variants = [];

      if (prod.slug.includes("marais")) {
        variants = [
          {
            id: "var-marais-blk",
            name: "Noir Black",
            color_hex: "#0E0E0E",
            images: [{ secure_url: img1, alt_text: `${prod.name} in Noir Black` }, { secure_url: img2, alt_text: `${prod.name} Noir Angle` }]
          },
          {
            id: "var-marais-tan",
            name: "Cognac Tan",
            color_hex: "#8B5A2B",
            images: [{ secure_url: img2, alt_text: `${prod.name} in Cognac Tan` }, { secure_url: img1, alt_text: `${prod.name} Tan Detail` }]
          },
          {
            id: "var-marais-ivory",
            name: "Ivory Cream",
            color_hex: "#EFECE6",
            images: [{ secure_url: "https://res.cloudinary.com/izdmpa4z/image/upload/v1789649479/dnora/products/the-celine-trapezoid-top-handle-1.jpg", alt_text: `${prod.name} in Ivory Cream` }]
          }
        ];
      } else if (prod.slug.includes("sienne")) {
        variants = [
          {
            id: "var-sienne-caramel",
            name: "Caramel Tan",
            color_hex: "#9C6644",
            images: [{ secure_url: img1, alt_text: `${prod.name} in Caramel Tan` }, { secure_url: img2, alt_text: `${prod.name} Detail` }]
          },
          {
            id: "var-sienne-blk",
            name: "Noir Black",
            color_hex: "#0E0E0E",
            images: [{ secure_url: img2, alt_text: `${prod.name} in Noir Black` }, { secure_url: img1, alt_text: `${prod.name} Angle` }]
          },
          {
            id: "var-sienne-olive",
            name: "Olive Smoke",
            color_hex: "#4A4F44",
            images: [{ secure_url: "https://res.cloudinary.com/izdmpa4z/image/upload/v1789671641/dnora/products/BROWN%20MAHENDI.jpg", alt_text: `${prod.name} in Olive` }]
          }
        ];
      } else if (prod.slug.includes("atelier")) {
        variants = [
          {
            id: "var-tote-cream",
            name: "Alabaster Cream",
            color_hex: "#F5F3EF",
            images: [{ secure_url: img1, alt_text: `${prod.name} in Alabaster Cream` }, { secure_url: img2, alt_text: `${prod.name} Interior` }]
          },
          {
            id: "var-tote-blk",
            name: "Noir Black",
            color_hex: "#0E0E0E",
            images: [{ secure_url: img2, alt_text: `${prod.name} in Noir Black` }, { secure_url: img1, alt_text: `${prod.name} Side` }]
          },
          {
            id: "var-tote-taupe",
            name: "Warm Taupe",
            color_hex: "#7D756C",
            images: [{ secure_url: "https://res.cloudinary.com/izdmpa4z/image/upload/v1789649481/dnora/products/the-soho-foldover-crossbody-1.jpg", alt_text: `${prod.name} in Warm Taupe` }]
          }
        ];
      } else if (prod.slug.includes("lune")) {
        variants = [
          {
            id: "var-lune-blk",
            name: "Noir Black",
            color_hex: "#0E0E0E",
            images: [{ secure_url: img1, alt_text: `${prod.name} in Noir Black` }, { secure_url: img2, alt_text: `${prod.name} Strap` }]
          },
          {
            id: "var-lune-espresso",
            name: "Espresso",
            color_hex: "#382923",
            images: [{ secure_url: img2, alt_text: `${prod.name} in Espresso` }, { secure_url: img1, alt_text: `${prod.name} Hardware` }]
          },
          {
            id: "var-lune-clay",
            name: "Clay Blush",
            color_hex: "#C2A69A",
            images: [{ secure_url: "https://res.cloudinary.com/izdmpa4z/image/upload/v1789649477/dnora/products/the-verona-braided-shoulder-bag-1.jpg", alt_text: `${prod.name} in Clay Blush` }]
          }
        ];
      } else if (prod.slug.includes("celine")) {
        variants = [
          {
            id: "var-celine-ivory",
            name: "Ivory White",
            color_hex: "#FAF9F6",
            images: [{ secure_url: img1, alt_text: `${prod.name} in Ivory White` }, { secure_url: img2, alt_text: `${prod.name} Lock Detail` }]
          },
          {
            id: "var-celine-noir",
            name: "Noir Black",
            color_hex: "#0E0E0E",
            images: [{ secure_url: img2, alt_text: `${prod.name} in Noir Black` }, { secure_url: img1, alt_text: `${prod.name} Side Profile` }]
          },
          {
            id: "var-celine-bordeaux",
            name: "Bordeaux Burgundy",
            color_hex: "#581825",
            images: [{ secure_url: "https://res.cloudinary.com/izdmpa4z/image/upload/v1789649475/dnora/products/the-palais-micro-vanity-1.jpg", alt_text: `${prod.name} in Bordeaux Burgundy` }]
          }
        ];
      } else if (prod.slug.includes("verona")) {
        variants = [
          {
            id: "var-verona-cognac",
            name: "Cognac Saddle",
            color_hex: "#8B5A2B",
            images: [{ secure_url: img1, alt_text: `${prod.name} in Cognac Saddle` }, { secure_url: img2, alt_text: `${prod.name} Weave` }]
          },
          {
            id: "var-verona-noir",
            name: "Noir Black",
            color_hex: "#0E0E0E",
            images: [{ secure_url: img2, alt_text: `${prod.name} in Noir Black` }, { secure_url: img1, alt_text: `${prod.name} Handle` }]
          }
        ];
      } else if (prod.slug.includes("palais")) {
        variants = [
          {
            id: "var-palais-noir",
            name: "Noir Black",
            color_hex: "#0E0E0E",
            images: [{ secure_url: img1, alt_text: `${prod.name} in Noir Black` }, { secure_url: img2, alt_text: `${prod.name} Vanity Vanity` }]
          },
          {
            id: "var-palais-gold",
            name: "Champagne Metallic",
            color_hex: "#D9C9B4",
            images: [{ secure_url: img2, alt_text: `${prod.name} in Champagne Metallic` }, { secure_url: img1, alt_text: `${prod.name} Clasp` }]
          }
        ];
      } else if (prod.slug.includes("soho")) {
        variants = [
          {
            id: "var-soho-slate",
            name: "Slate Charcoal",
            color_hex: "#2C2C2E",
            images: [{ secure_url: img1, alt_text: `${prod.name} in Slate Charcoal` }, { secure_url: img2, alt_text: `${prod.name} Profile` }]
          },
          {
            id: "var-soho-tan",
            name: "Amber Tan",
            color_hex: "#A36836",
            images: [{ secure_url: img2, alt_text: `${prod.name} in Amber Tan` }, { secure_url: img1, alt_text: `${prod.name} Foldover` }]
          }
        ];
      } else {
        variants = [
          {
            id: `var-${prod.id}-1`,
            name: "Noir Black",
            color_hex: "#0E0E0E",
            images: [{ secure_url: img1, alt_text: `${prod.name} in Noir Black` }]
          },
          {
            id: `var-${prod.id}-2`,
            name: "Umber Brown",
            color_hex: "#5C4033",
            images: [{ secure_url: img2, alt_text: `${prod.name} in Umber Brown` }]
          }
        ];
      }

      await pool.query(`
        UPDATE public.products 
        SET color_variants = $1::jsonb 
        WHERE id = $2;
      `, [JSON.stringify(variants), prod.id]);

      console.log(`✓ Updated [${prod.name}] with ${variants.length} color variants.`);
    }

    console.log("All products updated with luxury color variants successfully.");
  } catch (err) {
    console.error("Error seeding product variants:", err);
  } finally {
    await pool.end();
  }
}

main();
