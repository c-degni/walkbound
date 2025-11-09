# Boss & Character Battle Assets

## Boss Images
Place boss PNG files here: `client/src/assets/bosses/`

### Required Files:
- `boss_1.png` - First weekly boss (150x150px recommended)
- `boss_2.png`, `boss_3.png`, etc. - Additional bosses

### Guidelines:
- **Format**: PNG with transparent background
- **Size**: 256x256px (will be scaled appropriately)
- **Style**: Medieval fantasy monsters/enemies matching Walkbound theme
- **Examples**: Dragon, demon, giant, undead knight, etc.

## Character Back View
Place in: `client/src/assets/characters/`

### Required File:
- `warrior_back.png` - Character seen from behind during battle (100x100px in modal)

### Guidelines:
- Show character from behind (back view)
- Same character as `warrior.png` but back-facing
- Used in battle modal when fighting boss
- Should match equipment/level of main character

## Dynamic Boss Selection Example:
```javascript
// In BossFightScreen.js, modify getCharacterImage():
const getBossImage = () => {
  const bossImages = {
    'Dragon Lord': require('../assets/bosses/boss_dragon.png'),
    'Undead Knight': require('../assets/bosses/boss_undead.png'),
    'Fire Demon': require('../assets/bosses/boss_demon.png')
  };
  return bossImages[boss.name] || require('../assets/bosses/boss_1.png');
};
```

## Boss Special Abilities Examples:
- "Increased Strength - Deals 20% more damage"
- "Enhanced Defense - Takes 15% less damage"  
- "Intelligence Boost - Higher dodge chance"
- "Regeneration - Heals 5% HP every 30 seconds"
- "Berserker Rage - Attacks twice as fast when below 50% HP"