import { 
  hexToNpub, 
  npubToHex, 
  formatNpubForDisplay,
  DEFAULT_RELAYS
} from '../../lib/nostrProfile';

describe('Nostr Profile Utilities', () => {
  describe('hexToNpub', () => {
    it('should convert a valid hex pubkey to npub format', () => {
      const hexPubkey = 'd732ec06cb2a30f4d9455d8042ed067010cf27333abefca216b06a20a702f995';
      const npub = hexToNpub(hexPubkey);
      expect(npub).toMatch(/^npub1/);
      expect(npub.length).toBeGreaterThan(60);
    });

    it('should return an empty string for an invalid hex pubkey', () => {
      const invalidHex = 'not-a-valid-hex';
      const npub = hexToNpub(invalidHex);
      expect(npub).toBe('');
    });

    it('should return an empty string for empty input', () => {
      const npub = hexToNpub('');
      expect(npub).toBe('');
    });
  });

  describe('npubToHex', () => {
    it('should convert a valid npub to hex format', () => {
      // Using a Nostr test key that we know is valid
      const npub = 'npub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s';
      const hex = npubToHex(npub);
      expect(hex).toMatch(/^[0-9a-f]{64}$/i);
    });

    it('should return an empty string for an invalid npub', () => {
      const invalidNpub = 'not-a-valid-npub';
      const hex = npubToHex(invalidNpub);
      expect(hex).toBe('');
    });

    it('should return an empty string for empty input', () => {
      const hex = npubToHex('');
      expect(hex).toBe('');
    });
  });

  describe('formatNpubForDisplay', () => {
    it('should truncate npub format to show last 6 digits', () => {
      const npub = 'npub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s';
      const formatted = formatNpubForDisplay(npub);
      expect(formatted).toBe('...evkk5s');
    });

    it('should convert hex format to npub and show last 6 digits', () => {
      const hex = '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d';
      const formatted = formatNpubForDisplay(hex);
      // We can't predict the exact output since hexToNpub conversion is involved
      expect(formatted).toMatch(/^\.\.\.[a-zA-Z0-9]{6}$/);
    });

    it('should not modify test keys', () => {
      const testKey = 'pk_test_1234567890';
      const formatted = formatNpubForDisplay(testKey);
      expect(formatted).toBe(testKey);
    });

    it('should handle empty input', () => {
      const formatted = formatNpubForDisplay('');
      expect(formatted).toBe('');
    });

    it('should truncate other formats to last 6 characters', () => {
      const otherFormat = 'unknown_format_12345678';
      const formatted = formatNpubForDisplay(otherFormat);
      expect(formatted).toBe('...345678');
    });
  });

  describe('DEFAULT_RELAYS', () => {
    it('should have a list of relay URLs', () => {
      expect(DEFAULT_RELAYS).toBeInstanceOf(Array);
      expect(DEFAULT_RELAYS.length).toBeGreaterThan(0);
      DEFAULT_RELAYS.forEach(relay => {
        expect(relay).toMatch(/^wss:\/\//);
      });
    });
  });
});