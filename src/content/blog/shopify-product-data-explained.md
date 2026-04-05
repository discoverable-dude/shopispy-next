---
title: "Shopify Product Data: What Fields Exist and How to Use Them"
description: "A technical guide to every Shopify product field — titles, variants, metafields, tags, and more — plus how to leverage this data for competitive research."
date: "2026-01-05"
tags: ["shopify", "data", "technical"]
---

## Understanding Shopify's Product Data Model

Every Shopify product is more than a title and a price. Behind the storefront sits a structured data model with dozens of fields that control how products appear, get discovered, and behave at checkout. Whether you are building a store, developing an app, or researching competitors, understanding this data model is essential.

This guide covers every major product field, what it does, and how to use it effectively.

## Core Product Fields

### Title

The product name displayed to customers. Shopify imposes no character limit, but best practice keeps titles under 70 characters for SEO. Titles appear in search results, collection pages, and cart summaries.

### Description (Body HTML)

The main product description, stored as HTML. This field supports rich text formatting including headings, lists, images, and embedded media. Search engines index this content, making it a primary SEO asset.

### Vendor

The product manufacturer or brand name. Useful for stores carrying multiple brands. Shopify allows filtering by vendor, and it appears in the product JSON output.

### Product Type

A single categorization string. Unlike tags, each product has exactly one product type. This field is used for automated collections and internal organization. Examples: "T-Shirt," "Moisturizer," "Wireless Earbuds."

### Status

One of three values: `active`, `draft`, or `archived`. Only active products are visible on the storefront. Draft products are works in progress. Archived products are hidden but retained for historical records.

### Tags

A comma-separated list of keywords attached to the product. Tags power automated collections, internal search, and filtering. There is no limit to the number of tags, but overuse can create management headaches. Effective tag strategies use consistent naming conventions.

## Variant Fields

Every Shopify product has at least one variant. Variants represent different options — sizes, colors, materials — of the same product.

### Variant Title

Generated automatically from option values (e.g., "Large / Blue"). Displayed in the cart and order details.

### Price

The current selling price of the variant. Stored as a decimal string. This is the primary field that tools like **ShopiSpy** track for competitive price monitoring.

### Compare-at Price

The original or list price, shown with a strikethrough to indicate a discount. When this field is populated and higher than the price, Shopify displays the product as "on sale." A key field for identifying promotional pricing patterns.

### SKU

Stock Keeping Unit — an internal identifier for inventory management. Not displayed to customers by default but available in the product JSON. Useful for tracking specific items across systems.

### Barcode

Supports UPC, EAN, ISBN, and other barcode formats. Used for inventory scanning and marketplace integrations.

### Inventory Quantity

The current stock count for the variant. Publicly exposed through the Shopify API when inventory tracking is enabled. Some competitive research tools use this to estimate sales velocity by tracking quantity decreases over time.

### Weight and Weight Unit

Physical weight of the variant, used for shipping calculations. Stored with a unit (grams, kilograms, ounces, pounds).

### Requires Shipping

A boolean flag indicating whether the variant is a physical product that needs shipping. Digital products and services set this to false.

## Option Fields

Shopify products support up to three option types (e.g., Size, Color, Material). Each option can have multiple values.

### Option Name

The label for the option (e.g., "Size"). Displayed as a dropdown or selector on the product page.

### Option Values

The available choices for each option (e.g., "Small," "Medium," "Large"). Each unique combination of option values creates a variant.

## Media and Images

### Images

Products can have multiple images. Each image has a `src` URL, `alt` text for accessibility and SEO, `width`, `height`, and a `position` for ordering. The first image serves as the featured image in collection views and search results.

### Variant Images

Individual variants can be assigned specific images. This enables color-specific photography where selecting "Blue" shows the blue product image.

## SEO and Discovery Fields

### Handle

The URL slug for the product (e.g., `awesome-t-shirt` in `/products/awesome-t-shirt`). Auto-generated from the title but editable. Changing handles can break existing links, so modify with caution.

### SEO Title (Meta Title)

An optional override for the page title tag. If blank, Shopify uses the product title. Best practice is crafting a unique meta title under 60 characters for each product.

### SEO Description (Meta Description)

An optional override for the meta description tag. If blank, Shopify pulls from the product description. Keep under 155 characters for full display in search results.

## Metafields

Metafields extend the product data model with custom key-value pairs. They are the most flexible and powerful data structure in Shopify.

### Common Metafield Uses

- **Specifications:** Technical details like dimensions, materials, or compatibility
- **Custom content:** Care instructions, size guides, or ingredient lists
- **Structured data:** JSON-LD markup for rich search results
- **Cross-references:** Related product links, bundle components

Metafields are accessible through the API and, since Shopify 2.0 themes, directly in Liquid templates. They are not visible through the public `products.json` endpoint, which means competitive research tools typically cannot access them.

## The Public Products JSON Endpoint

Every Shopify store exposes product data at `/products.json`. This endpoint returns core product fields, variants, images, and basic metadata in a structured JSON format. It is the foundation that tools like **ShopiSpy** use to track product catalogs and pricing across stores.

Fields available through this endpoint include: title, description, vendor, product type, tags, variants (with prices, SKUs, and inventory policies), and images. Metafields and some internal fields are excluded.

## How to Use This Knowledge

Understanding Shopify's data model helps in several ways:

- **Store owners:** Structure your product data to maximize SEO and discoverability
- **Developers:** Build integrations that leverage the full product schema
- **Researchers:** Know exactly what data is publicly available for competitive analysis
- **Marketers:** Use tags, collections, and metafields to enable advanced filtering and personalization

The better you understand the data behind Shopify products, the more effectively you can build, analyze, and compete in the ecosystem.
