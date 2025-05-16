// Quick utility to convert npub to hex and vice versa
const { nip19 } = require('nostr-tools');

function npubToHex(npub) {
  try {
    if (!npub || !npub.startsWith('npub1')) {
      console.error('Invalid npub format');
      return null;
    }
    const { data } = nip19.decode(npub);
    return data;
  } catch (error) {
    console.error('Error converting npub to hex:', error);
    return null;
  }
}

function hexToNpub(hex) {
  try {
    if (!hex || hex.length !== 64) {
      console.error('Invalid hex format');
      return null;
    }
    return nip19.npubEncode(hex);
  } catch (error) {
    console.error('Error converting hex to npub:', error);
    return null;
  }
}

// Convert the provided npub to hex
const adminNpub = 'npub1sv4k42pz6plnsz5876gh3j4asg7xs2efspzq0xfn26av6tj0pq4q4tpzed';
const hex = npubToHex(adminNpub);
console.log('Hex:', hex);

// Convert the hex back to npub for verification
const npubVerify = hexToNpub(hex);
console.log('Npub verify:', npubVerify);

// Convert the npub from the UI to hex
const uiNpub = 'npub14m8j35axdj02egll9wtg90nkeyx227dthzy6nv7p9j9n3cqvva5qs3vjt2';
const uiHex = npubToHex(uiNpub);
console.log('UI Hex:', uiHex);