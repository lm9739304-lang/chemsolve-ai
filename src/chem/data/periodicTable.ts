export interface Element {
  number: number
  symbol: string
  name: string
  mass: number
  group: number | null
  period: number
  category: string
  config: string
  oxidationStates: number[]
  electronegativity: number | null
  meltingPoint: number | null // °C
  boilingPoint: number | null // °C
  density: number | null // g/cm³
  uses: string
}

const E = (
  number: number, symbol: string, name: string, mass: number, group: number | null, period: number,
  category: string, config: string, oxidationStates: number[], electronegativity: number | null,
  meltingPoint: number | null, boilingPoint: number | null, density: number | null, uses: string,
): Element => ({ number, symbol, name, mass, group, period, category, config, oxidationStates, electronegativity, meltingPoint, boilingPoint, density, uses })

const TABLE: Element[] = [
  E(1,'H','Hydrogen',1.008,1,1,'nonmetal','1s1',[1,-1],2.20,-259.1,-252.9,0.0000899,'Fuel, ammonia, hydrogenation'),
  E(2,'He','Helium',4.0026,18,1,'noble','1s2',[0],null,-272.2,-268.9,0.0001785,'Balloons, cryogenics, shielding gas'),
  E(3,'Li','Lithium',6.94,1,2,'alkali','[He] 2s1',[1],0.98,180.5,1342,0.534,'Batteries, ceramics, medicine'),
  E(4,'Be','Beryllium',9.0122,2,2,'alkaline','[He] 2s2',[2],1.57,1287,2469,1.85,'Aerospace alloys, X-ray windows'),
  E(5,'B','Boron',10.81,13,2,'metalloid','[He] 2s2 2p1',[3],2.04,2075,4000,2.34,'Glass, detergents, semiconductors'),
  E(6,'C','Carbon',12.011,14,2,'nonmetal','[He] 2s2 2p2',[-4,2,4],2.55,3550,4027,2.267,'Steel, fuels, life'),
  E(7,'N','Nitrogen',14.007,15,2,'nonmetal','[He] 2s2 2p3',[-3,3,5],3.04,-210,-196,0.0012506,'Fertilizers, explosives, atmosphere'),
  E(8,'O','Oxygen',15.999,16,2,'nonmetal','[He] 2s2 2p4',[-2],3.44,-218.8,-183,0.001429,'Breathing, combustion, steel'),
  E(9,'F','Fluorine',18.998,17,2,'halogen','[He] 2s2 2p5',[-1],3.98,-219.7,-188.1,0.001696,'Toothpaste, Teflon, refrigerants'),
  E(10,'Ne','Neon',20.18,18,2,'noble','[He] 2s2 2p6',[0],null,-248.6,-246,0.0009002,'Neon signs, lasers'),
  E(11,'Na','Sodium',22.99,1,3,'alkali','[Ne] 3s1',[1],0.93,97.8,883,0.97,'Table salt, soap, coolant'),
  E(12,'Mg','Magnesium',24.305,2,3,'alkaline','[Ne] 3s2',[2],1.31,650,1091,1.74,'Alloys, fireworks, flares'),
  E(13,'Al','Aluminium',26.982,13,3,'post-transition','[Ne] 3s2 3p1',[3],1.61,660.3,2470,2.7,'Cans, aircraft, wiring'),
  E(14,'Si','Silicon',28.085,14,3,'metalloid','[Ne] 3s2 3p2',[-4,4],1.90,1414,3265,2.33,'Semiconductors, glass, solar'),
  E(15,'P','Phosphorus',30.974,15,3,'nonmetal','[Ne] 3s2 3p3',[-3,3,5],2.19,44.1,280,1.82,'Fertilizers, matches, detergents'),
  E(16,'S','Sulfur',32.06,16,3,'nonmetal','[Ne] 3s2 3p4',[-2,2,4,6],2.58,115.2,444.6,2.07,'Sulfuric acid, vulcanization'),
  E(17,'Cl','Chlorine',35.45,17,3,'halogen','[Ne] 3s2 3p5',[-1,1,3,5,7],3.16,-101.5,-34.04,0.003214,'Disinfection, PVC, salt'),
  E(18,'Ar','Argon',39.948,18,3,'noble','[Ne] 3s2 3p6',[0],null,-189.3,-185.8,0.001784,'Welding, lighting, insulation'),
  E(19,'K','Potassium',39.098,1,4,'alkali','[Ar] 4s1',[1],0.82,63.5,759,0.862,'Fertilizers, soaps, glass'),
  E(20,'Ca','Calcium',40.078,2,4,'alkaline','[Ar] 4s2',[2],1.0,842,1484,1.55,'Cement, bones, steelmaking'),
  E(21,'Sc','Scandium',44.956,3,4,'transition','[Ar] 3d1 4s2',[3],1.36,1541,2836,2.99,'Alloys, aerospace'),
  E(22,'Ti','Titanium',47.867,4,4,'transition','[Ar] 3d2 4s2',[2,3,4],1.54,1668,3287,4.54,'Aerospace, implants, pigments'),
  E(23,'V','Vanadium',50.942,5,4,'transition','[Ar] 3d3 4s2',[2,3,4,5],1.63,1910,3407,6.11,'Steel alloys, batteries'),
  E(24,'Cr','Chromium',51.996,6,4,'transition','[Ar] 3d5 4s1',[2,3,6],1.66,1907,2672,7.19,'Stainless steel, plating'),
  E(25,'Mn','Manganese',54.938,7,4,'transition','[Ar] 3d5 4s2',[2,4,7],1.55,1246,2061,7.43,'Steel, batteries, pigments'),
  E(26,'Fe','Iron',55.845,8,4,'transition','[Ar] 3d6 4s2',[2,3],1.83,1538,2861,7.87,'Steel, construction, tools'),
  E(27,'Co','Cobalt',58.933,9,4,'transition','[Ar] 3d7 4s2',[2,3],1.88,1495,2927,8.9,'Batteries, magnets, alloys'),
  E(28,'Ni','Nickel',58.693,10,4,'transition','[Ar] 3d8 4s2',[2,3],1.91,1455,2913,8.9,'Stainless steel, coins, batteries'),
  E(29,'Cu','Copper',63.546,11,4,'transition','[Ar] 3d10 4s1',[1,2],1.90,1084.6,2562,8.96,'Wiring, plumbing, coins'),
  E(30,'Zn','Zinc',65.38,12,4,'transition','[Ar] 3d10 4s2',[2],1.65,419.5,907,7.13,'Galvanizing, alloys, ointments'),
  E(31,'Ga','Gallium',69.723,13,4,'post-transition','[Ar] 3d10 4s2 4p1',[3],1.81,29.8,2403,5.91,'Semiconductors, LEDs'),
  E(32,'Ge','Germanium',72.63,14,4,'metalloid','[Ar] 3d10 4s2 4p2',[2,4],2.01,938.2,2833,5.32,'Optics, semiconductors'),
  E(33,'As','Arsenic',74.922,15,4,'metalloid','[Ar] 3d10 4s2 4p3',[-3,3,5],2.18,817, null,5.78,'Semiconductors, pesticides'),
  E(34,'Se','Selenium',78.971,16,4,'nonmetal','[Ar] 3d10 4s2 4p4',[-2,2,4,6],2.55,221,685,4.81,'Glass, electronics, supplements'),
  E(35,'Br','Bromine',79.904,17,4,'halogen','[Ar] 3d10 4s2 4p5',[-1,1,5],2.96,-7.2,58.8,3.12,'Flame retardants, photography'),
  E(36,'Kr','Krypton',83.798,18,4,'noble','[Ar] 3d10 4s2 4p6',[0],3.0,-157.4,-153.2,0.003733,'Lighting, lasers'),
  E(37,'Rb','Rubidium',85.468,1,5,'alkali','[Kr] 5s1',[1],0.82,39.3,688,1.532,'Atomic clocks, research'),
  E(38,'Sr','Strontium',87.62,2,5,'alkaline','[Kr] 5s2',[2],0.95,777,1382,2.64,'Fireworks, magnets'),
  E(39,'Y','Yttrium',88.906,3,5,'transition','[Kr] 4d1 5s2',[3],1.22,1526,3344,4.47,'LEDs, superconductors'),
  E(40,'Zr','Zirconium',91.224,4,5,'transition','[Kr] 4d2 5s2',[4],1.33,1855,4409,6.52,'Nuclear, ceramics, gems'),
  E(41,'Nb','Niobium',92.906,5,5,'transition','[Kr] 4d4 5s1',[3,5],1.6,2477,4742,8.57,'Superalloys, superconductors'),
  E(42,'Mo','Molybdenum',95.95,6,5,'transition','[Kr] 4d5 5s1',[2,4,6],2.16,2623,4639,10.28,'Steel, catalysts, lubricants'),
  E(43,'Tc','Technetium',98,7,5,'transition','[Kr] 4d5 5s2',[4,7],1.9,2157,4265,11,'Medical imaging'),
  E(44,'Ru','Ruthenium',101.07,8,5,'transition','[Kr] 4d7 5s1',[2,3,4],2.2,2334,4150,12.37,'Electronics, catalysts'),
  E(45,'Rh','Rhodium',102.91,9,5,'transition','[Kr] 4d8 5s1',[3],2.28,1964,3695,12.41,'Catalytic converters, jewelry'),
  E(46,'Pd','Palladium',106.42,10,5,'transition','[Kr] 4d10',[2,4],2.20,1555,2963,12.02,'Catalysts, jewelry, dentistry'),
  E(47,'Ag','Silver',107.87,11,5,'transition','[Kr] 4d10 5s1',[1],1.93,961.8,2162,10.49,'Jewelry, electronics, mirrors'),
  E(48,'Cd','Cadmium',112.41,12,5,'transition','[Kr] 4d10 5s2',[2],1.69,321.1,767,8.65,'Batteries, pigments'),
  E(49,'In','Indium',114.82,13,5,'post-transition','[Kr] 4d10 5s2 5p1',[1,3],1.78,156.2,2080,7.31,'Touchscreens, alloys'),
  E(50,'Sn','Tin',118.71,14,5,'post-transition','[Kr] 4d10 5s2 5p2',[2,4],1.96,231.9,2602,7.29,'Solder, plating, alloys'),
  E(51,'Sb','Antimony',121.76,15,5,'metalloid','[Kr] 4d10 5s2 5p3',[-3,3,5],2.05,630.6,1587,6.70,'Flame retardants, alloys'),
  E(52,'Te','Tellurium',127.6,16,5,'metalloid','[Kr] 4d10 5s2 5p4',[-2,2,4,6],2.1,449.5,988,6.24,'Solar cells, alloys'),
  E(53,'I','Iodine',126.9,17,5,'halogen','[Kr] 4d10 5s2 5p5',[-1,1,5,7],2.66,113.7,184.3,4.93,'Medicine, dye, photography'),
  E(54,'Xe','Xenon',131.29,18,5,'noble','[Kr] 4d10 5s2 5p6',[0,2,4,6],2.6,-111.8,-108.1,0.005887,'Lighting, anesthesia'),
  E(55,'Cs','Caesium',132.91,1,6,'alkali','[Xe] 6s1',[1],0.79,28.4,671,1.879,'Atomic clocks, drilling'),
  E(56,'Ba','Barium',137.33,2,6,'alkaline','[Xe] 6s2',[2],0.89,727,1897,3.62,'Drilling, fireworks, x-rays'),
  E(57,'La','Lanthanum',138.91,3,6,'lanthanide','[Xe] 5d1 6s2',[3],1.1,920,3464,6.15,'Glass, catalysts, batteries'),
  E(58,'Ce','Cerium',140.12,null,6,'lanthanide','[Xe] 4f1 5d1 6s2',[3,4],1.12,798,3443,6.77,'Catalysts, glass polishing'),
  E(59,'Pr','Praseodymium',140.91,null,6,'lanthanide','[Xe] 4f3 6s2',[3],1.13,931,3512,6.77,'Magnets, glass, alloys'),
  E(60,'Nd','Neodymium',144.24,null,6,'lanthanide','[Xe] 4f4 6s2',[3],1.14,1021,3074,7.0,'Magnets, lasers, glass'),
  E(61,'Pm','Promethium',145,null,6,'lanthanide','[Xe] 4f5 6s2',[3],1.13,1042,3000,7.26,'Nuclear batteries'),
  E(62,'Sm','Samarium',150.36,null,6,'lanthanide','[Xe] 4f6 6s2',[2,3],1.17,1074,1794,7.52,'Magnets, cancer therapy'),
  E(63,'Eu','Europium',151.96,null,6,'lanthanide','[Xe] 4f7 6s2',[2,3],1.2,822,1529,5.24,'Phosphors, control rods'),
  E(64,'Gd','Gadolinium',157.25,null,6,'lanthanide','[Xe] 4f7 5d1 6s2',[3],1.2,1313,3273,7.9,'MRI contrast, magnets'),
  E(65,'Tb','Terbium',158.93,null,6,'lanthanide','[Xe] 4f9 6s2',[3,4],1.1,1356,3230,8.23,'Phosphors, magnets'),
  E(66,'Dy','Dysprosium',162.5,null,6,'lanthanide','[Xe] 4f10 6s2',[3],1.22,1412,2567,8.54,'Magnets, lasers'),
  E(67,'Ho','Holmium',164.93,null,6,'lanthanide','[Xe] 4f11 6s2',[3],1.23,1474,2700,8.79,'Magnets, lasers'),
  E(68,'Er','Erbium',167.26,null,6,'lanthanide','[Xe] 4f12 6s2',[3],1.24,1529,2868,9.07,'Fiber optics, lasers'),
  E(69,'Tm','Thulium',168.93,null,6,'lanthanide','[Xe] 4f13 6s2',[3],1.25,1545,1950,9.32,'Lasers, x-ray sources'),
  E(70,'Yb','Ytterbium',173.05,null,6,'lanthanide','[Xe] 4f14 6s2',[2,3],1.1,824,1196,6.9,'Lasers, atomic clocks'),
  E(71,'Lu','Lutetium',174.97,null,6,'lanthanide','[Xe] 4f14 5d1 6s2',[3],1.27,1663,3402,9.84,'Catalysts, PET scanners'),
  E(72,'Hf','Hafnium',178.49,4,6,'transition','[Xe] 4f14 5d2 6s2',[4],1.3,2233,4603,13.31,'Nuclear rods, alloys'),
  E(73,'Ta','Tantalum',180.95,5,6,'transition','[Xe] 4f14 5d3 6s2',[5],1.5,3017,5458,16.69,'Capacitors, alloys'),
  E(74,'W','Tungsten',183.84,6,6,'transition','[Xe] 4f14 5d4 6s2',[2,4,6],2.36,3422,5555,19.25,'Filaments, tools, armor'),
  E(75,'Re','Rhenium',186.21,7,6,'transition','[Xe] 4f14 5d5 6s2',[4,7],1.9,3186,5596,21.02,'Superalloys, catalysts'),
  E(76,'Os','Osmium',190.23,8,6,'transition','[Xe] 4f14 5d6 6s2',[4,8],2.2,3033,5012,22.59,'Alloys, instrument pivots'),
  E(77,'Ir','Iridium',192.22,9,6,'transition','[Xe] 4f14 5d7 6s2',[3,4],2.20,2446,4428,22.56,'Spark plugs, electrodes'),
  E(78,'Pt','Platinum',195.08,10,6,'transition','[Xe] 4f14 5d9 6s1',[2,4],2.28,1768,3825,21.45,'Catalysts, jewelry, electronics'),
  E(79,'Au','Gold',196.97,11,6,'transition','[Xe] 4f14 5d10 6s1',[1,3],2.54,1064.2,2856,19.3,'Jewelry, electronics, currency'),
  E(80,'Hg','Mercury',200.59,12,6,'transition','[Xe] 4f14 5d10 6s2',[1,2],2.0,-38.8,356.7,13.53,'Thermometers, lamps'),
  E(81,'Tl','Thallium',204.38,13,6,'post-transition','[Xe] 4f14 5d10 6s2 6p1',[1,3],2.04,304,1473,11.85,'Electronics, glass'),
  E(82,'Pb','Lead',207.2,14,6,'post-transition','[Xe] 4f14 5d10 6s2 6p2',[2,4],2.33,327.5,1749,11.34,'Batteries, radiation shielding'),
  E(83,'Bi','Bismuth',208.98,15,6,'post-transition','[Xe] 4f14 5d10 6s2 6p3',[3,5],2.02,271.4,1564,9.78,'Alloys, medicine, cosmetics'),
  E(84,'Po','Polonium',209,16,6,'post-transition','[Xe] 4f14 5d10 6s2 6p4',[2,4],2.0,254,962,9.3,'Radioactive heat sources'),
  E(85,'At','Astatine',210,17,6,'halogen','[Xe] 4f14 5d10 6s2 6p5',[-1,1,5],2.2,302,337, null,'Research, medicine'),
  E(86,'Rn','Radon',222,18,6,'noble','[Xe] 4f14 5d10 6s2 6p6',[0],null,-71,-61.8,0.00973,'Radiotherapy, research'),
  E(87,'Fr','Francium',223,1,7,'alkali','[Rn] 7s1',[1],0.7,27,677, null,'Research'),
  E(88,'Ra','Radium',226,2,7,'alkaline','[Rn] 7s2',[2],0.9,700,1140,5.5,'Radiotherapy (historical)'),
  E(89,'Ac','Actinium',227,null,7,'actinide','[Rn] 6d1 7s2',[3],1.1,1050,3470,10.07,'Radiotherapy, research'),
  E(90,'Th','Thorium',232.04,null,7,'actinide','[Rn] 6d2 7s2',[4],1.3,1750,4788,11.72,'Nuclear fuel, glass'),
  E(91,'Pa','Protactinium',231.04,null,7,'actinide','[Rn] 5f2 6d1 7s2',[4,5],1.5,1572,4000,15.37,'Research'),
  E(92,'U','Uranium',238.03,null,7,'actinide','[Rn] 5f3 6d1 7s2',[4,6],1.38,1132,3818,19.1,'Nuclear fuel, armor'),
  E(93,'Np','Neptunium',237,null,7,'actinide','[Rn] 5f4 6d1 7s2',[3,4,5,6],1.36,640,4000,20.45,'Research, detectors'),
  E(94,'Pu','Plutonium',244,null,7,'actinide','[Rn] 5f6 7s2',[3,4,5,6],1.28,640,3235,19.82,'Nuclear fuel, weapons'),
  E(95,'Am','Americium',243,null,7,'actinide','[Rn] 5f7 7s2',[3],1.3,1176,2607,12,'Smoke detectors'),
  E(96,'Cm','Curium',247,null,7,'actinide','[Rn] 5f7 6d1 7s2',[3],1.3,1345,3110,13.5,'Space power, neutron sources'),
  E(97,'Bk','Berkelium',247,null,7,'actinide','[Rn] 5f9 7s2',[3,4],1.3,986,2600,14,'Research'),
  E(98,'Cf','Californium',251,null,7,'actinide','[Rn] 5f10 7s2',[3],1.3,900,1470,15.1,'Neutron sources'),
  E(99,'Es','Einsteinium',252,null,7,'actinide','[Rn] 5f11 7s2',[3],1.3,860,996, null,'Research'),
  E(100,'Fm','Fermium',257,null,7,'actinide','[Rn] 5f12 7s2',[3],1.3,1527, null, null,'Research'),
  E(101,'Md','Mendelevium',258,null,7,'actinide','[Rn] 5f13 7s2',[3],1.3,827, null, null,'Research'),
  E(102,'No','Nobelium',259,null,7,'actinide','[Rn] 5f14 7s2',[2,3],1.3,827, null, null,'Research'),
  E(103,'Lr','Lawrencium',266,null,7,'actinide','[Rn] 5f14 7s2 7p1',[3],1.3,1627, null, null,'Research'),
  E(104,'Rf','Rutherfordium',267,4,7,'transition','[Rn] 5f14 6d2 7s2',[4],null,267, null, null,'Research'),
  E(105,'Db','Dubnium',268,5,7,'transition','[Rn] 5f14 6d3 7s2',[5],null,1052, null, null,'Research'),
  E(106,'Sg','Seaborgium',269,6,7,'transition','[Rn] 5f14 6d4 7s2',[6],null,3277, null, null,'Research'),
  E(107,'Bh','Bohrium',270,7,7,'transition','[Rn] 5f14 6d5 7s2',[7],null, null, null, null,'Research'),
  E(108,'Hs','Hassium',277,8,7,'transition','[Rn] 5f14 6d6 7s2',[0],null, null, null, null,'Research'),
  E(109,'Mt','Meitnerium',278,9,7,'transition','[Rn] 5f14 6d7 7s2',[0],null, null, null, null,'Research'),
  E(110,'Ds','Darmstadtium',281,10,7,'transition','[Rn] 5f14 6d8 7s2',[0],null, null, null, null,'Research'),
  E(111,'Rg','Roentgenium',282,11,7,'transition','[Rn] 5f14 6d9 7s2',[0],null, null, null, null,'Research'),
  E(112,'Cn','Copernicium',285,12,7,'transition','[Rn] 5f14 6d10 7s2',[2],null, null, null, null,'Research'),
  E(113,'Nh','Nihonium',286,13,7,'post-transition','[Rn] 5f14 6d10 7s2 7p1',[0],null, null, null, null,'Research'),
  E(114,'Fl','Flerovium',289,14,7,'post-transition','[Rn] 5f14 6d10 7s2 7p2',[0],null, null, null, null,'Research'),
  E(115,'Mc','Moscovium',290,15,7,'post-transition','[Rn] 5f14 6d10 7s2 7p3',[0],null, null, null, null,'Research'),
  E(116,'Lv','Livermorium',293,16,7,'post-transition','[Rn] 5f14 6d10 7s2 7p4',[0],null, null, null, null,'Research'),
  E(117,'Ts','Tennessine',294,17,7,'halogen','[Rn] 5f14 6d10 7s2 7p5',[0],null, null, null, null,'Research'),
  E(118,'Og','Oganesson',294,18,7,'noble','[Rn] 5f14 6d10 7s2 7p6',[0],null, null, null, null,'Research'),
]

export const SYMBOLS = TABLE.map(e => e.symbol)

export function getElement(symbol: string): Element | undefined {
  return TABLE.find(e => e.symbol.toLowerCase() === symbol.toLowerCase())
}

export function getElementByNumber(n: number): Element | undefined {
  return TABLE.find(e => e.number === n)
}

export function allElements(): Element[] {
  return TABLE
}

