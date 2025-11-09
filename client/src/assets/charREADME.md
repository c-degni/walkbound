# Character Assets

Place your character PNG files here.

## Required Files:
- `warrior.png` - Main character sprite/portrait (80x80px or larger, transparent background)

## Character Image Guidelines:
- **Format**: PNG with transparent background
- **Size**: Recommended 256x256px (will be scaled to 70x70 for home screen)
- **Style**: Should match the medieval fantasy theme of Walkbound logo
- **Variants**: You can create different images based on:
  - Character level (warrior_1.png, warrior_10.png, etc.)
  - Equipped items (warrior_sword.png, warrior_wizard_hat.png)
  - Character class (warrior.png, mage.png, tank.png)

## Dynamic Character Selection:
The app currently uses `warrior.png`. To make it dynamic based on equipment/level, modify HomeScreen.js:

```javascript
// Example: Change image based on equipment
const getCharacterImage = () => {
  if (character.equipment?.type === 'wizard_hat') {
    return require('../assets/characters/warrior_mage.png');
  } else if (character.equipment?.type === 'sword') {
    return require('../assets/characters/warrior_sword.png');
  }
  return require('../assets/characters/warrior.png');
};

// Then use: source={getCharacterImage()}
```

## Placeholder:
For development, use any RPG character sprite. Sites like itch.io or OpenGameArt.org have free assets.