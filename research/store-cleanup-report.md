# ShopiSpy — Store List Cleanup Report
Generated 2026-07-20. Source: full scrape run + direct endpoint probing (incl. domain-variant salvage).

## Summary
- **Stores in list:** 624
- **Live (returning products):** 500  (80% of full list)
- **Salvageable (moved domain):** 18
- **Dead / not Shopify (prune):** 69
- **Blocked 403 (proxy-only):** 13
- **Locked 401 (prune):** 4
- **Transient (keep, will retry):** 4
- **Live but 0 products (investigate):** 16

**If you prune the 69 dead + 4 locked entries, coverage becomes 500/551 = 91% of an honest list.**

---

## 1. SALVAGEABLE — update the domain in brands.ts + seed (18)
These 404'd on the listed domain but a variant returns live products. Change the domain to the "Works at" value.

| Brand | Listed domain | Works at |
|---|---|---|
| Again Faster | againfaster.co.uk | againfaster.com |
| Butternut Box | butternutbox.com | shop.butternutbox.com |
| Edgard & Cooper | edgardcooper.com | us.edgardcooper.com |
| Elemis | elemis.com | elemis.myshopify.com |
| Fiido UK | fiido.co.uk | fiido.com |
| Firebox | firebox.com | firebox.myshopify.com |
| Grove Bags | grove.co.uk | grove.com |
| Momentous (UK) | gains-in-bulk.com | gains-in-bulk.myshopify.com |
| Orange Tree Toys | orangetreetoys.co.uk | orangetreetoys.com |
| Pace Cycles | pace-cycles.com | pace-cycles.myshopify.com |
| Pimoroni | pimoroni.com | shop.pimoroni.com |
| Pooch & Mutt | poochandmutt.co.uk | poochandmutt.com |
| Ruark Audio | ruarkaudio.com | shop.ruarkaudio.com |
| Seedlip | seedlipdrinks.com | us.seedlipdrinks.com |
| Tern (UK) | ternbicycles.com | store.ternbicycles.com |
| Unagi UK | unagiscooters.com | shop.unagiscooters.com |
| Wild | wearewild.com | wearewild.myshopify.com |
| Wisper Bikes | wisperbikes.com | wisperbikes.myshopify.com |

---

## 2. PRUNE — dead / not Shopify (69)
No `/products.json` on the listed domain or any tried variant. Not scrapeable by this method — remove from the list.

| Brand | Domain | Code |
|---|---|---|
| Acupanel | theacousticcompany.co.uk | neterr |
| Assault Fitness | assaultfitness.com | 404 |
| Attaquer | attaquer.cc | 404 |
| Barbour Dog | barbour.com | 404 |
| Beyond NRG | beyondnrg.com | 404 |
| Blank Street Coffee | blankstreet.co.uk | 404 |
| Brompton Junction | brompton.com | 404 |
| Charlotte Tilbury | charlottetilbury.com | 404 |
| Cheeky Wipes | cheekywipes.com | 404 |
| Christopher Ward | christopherward.com | neterr |
| Coalatree UK / Scrubba | scrubba.co.uk | neterr |
| Cox & Cox | coxandcox.co.uk | 404 |
| Different Dog | differentdog.com | 404 |
| Dodo Juice | dodojuice.com | 404 |
| Free Soul | myfreesoul.com | 200 |
| Gocycle | gocycle.com | 404 |
| Happy Little Folks | happylittlefolks.com | 404 |
| Hownd | hownd.co.uk | neterr |
| Huel | huel.com | 404 |
| I Am Plus / Buddha Board style - Kano | kano.me | 404 |
| Iffley Road | iffleyroad.com | neterr |
| JoJo Maman Bebe | jojomamanbebe.com | neterr |
| Little Berry Button | littleberrybutton.co.uk | 404 |
| Little Bird Told Me | littlebirdtoldme.com | 404 |
| Mack Weldon | mackweldon.com | 200 |
| Mama Designs | mamadesigns.co.uk | neterr |
| MATE Bike | matebike.eu | neterr |
| Menkind | menkind.co.uk | 404 |
| Minirig | minirigs.co.uk | 404 |
| Mooltipass / GetDigital - Cuckooland | cuckooland.com | 404 |
| Neat Nutrition | neatnutrition.co.uk | 404 |
| Nibbling | nibbling.co.uk | neterr |
| Nukeproof | nukeproof.com | 404 |
| Nutribuddy | nutribuddy.com | neterr |
| Oliver Bonas | oliverbonas.com | 404 |
| Olivia Burton | oliviaburton.com | neterr |
| Orbitsound | orbitsound.com | 404 |
| Outsiders Store | outsiders-store.com | neterr |
| Pact Coffee | pactcoffee.com | 404 |
| Pandora (UK) | pandorajewellery.co.uk | neterr |
| Patch Plants | patchplants.com | 404 |
| Pella Sportswear | pellasportswear.com | 404 |
| ProDog Raw | prodograw.com | 404 |
| Pura | pura.com | 404 |
| Purrform | purrform.co.uk | 404 |
| Ralph & Co | ralphandco.co.uk | neterr |
| Rapha | rapha.cc | 404 |
| REN Clean Skincare | renskincare.com | neterr |
| RHA Audio | rha-audio.com | neterr |
| Rise | riseuk.com | neterr |
| Santini UK | santinicycling.co.uk | neterr |
| Senreve | senreve.com | 404 |
| SOAR Running | soarrunning.com | neterr |
| Son of a Tailor | sonofatailor.com | 404 |
| Stolen Goat | stolengoat.com | 404 |
| Swoon Editions | swooneditions.com | 404 |
| The Book of Everyone / Prezzybox | prezzybox.com | 404 |
| The Little Loft | thelittleloft.co.uk | neterr |
| Thomas Sabo UK | thomassabo.com | 404 |
| Thousand (UK) | explorethousand.co.uk | neterr |
| Tracksmith UK | eu.tracksmith.com | neterr |
| Trinny London | trinnylondon.com | 404 |
| TRIP Drinks | drinktrip.com | neterr |
| Tweezerman-alternative: Beauty Works | beautyworksonline.com | 404 |
| Veho | veho-world.com | 404 |
| Vet's Kitchen | vetskitchen.co.uk | 404 |
| VOLT Bikes | voltbikes.co.uk | 404 |
| WIT Fitness | witfitness.com | 404 |
| Woof Dog Store | woofdogstore.com | neterr |

---

## 3. BLOCKED — 403, proxy-only (13)
On Shopify but hard-blocking datacenter IPs. A residential proxy / scraping API *could* recover these. Only worth it if a brand here is must-have.

| Brand | Domain |
|---|---|
| Aspinal of London | aspinaloflondon.com |
| Bowman Cycles | bowman-cycles.com |
| Cambridge Audio | cambridgeaudio.com |
| Grovemade EU/UK | grovemade.com |
| Hiive | hiive.co.uk |
| Katkin | katkin.com |
| Mirafit | mirafit.co.uk |
| Niwaki | niwaki.com |
| Presca Teamwear | prescateamwear.com |
| Quincy Mae | quincymae.com |
| Sipful | sipful.co.uk |
| Soho Home | sohohome.com |
| Tails.com | tails.com |

---

## 4. LOCKED — 401 (4)
Endpoint requires auth — not publicly scrapeable. Prune.

| Brand | Domain |
|---|---|
| Bambino Mio | bambinomio.com |
| Proporta | proporta.co.uk |
| Swoof | swoof.co.uk |
| Western Rise | westernrise.com |

---

## 5. TRANSIENT — keep, retries will catch these (4)
503/500/timeout at probe time. Likely to succeed on a later daily run; no action.

| Brand | Domain | Code |
|---|---|---|
| Bella & Duke | bellaandduke.com | timeout |
| Ergobaby UK | ergobaby.co.uk | 503 |
| Maxwell-Scott | maxwellscottbags.com | 503 |
| Sungod | sungod.co | 500 |

---

## 6. LIVE BUT 0 PRODUCTS — investigate (16)
Endpoint responded but returned no products (empty catalog, or products behind a different path).

| Brand | Domain |
|---|---|
| Bo+Tee | bo-tee.com |
| Doisy & Dam | doisyanddam.com |
| Form Nutrition | formnutrition.com |
| Freego E-Bikes | freego.eu |
| Genesis Bikes | genesisbikes.co.uk |
| Illamasqua | illamasqua.com |
| Kettlebell Kings UK | kettlebellkings.co.uk |
| Kip & Twiggy's | kipandtwiggys.com |
| LIFX UK | lifx.co.uk |
| ME+EM | meandem.com |
| Seraphine | seraphine.com |
| Skin + Me | skinandme.com |
| Swytch Bike | swytchbike.com |
| Tribal Pet Foods | tribalpetfoods.co.uk |
| Troubadour Goods | troubadourgoods.com |
| Vashi | vashi.com |
