import { describe, expect, it } from "vitest";
import { haversineDistance } from "@/lib/geo";

describe("haversineDistance", () => {
    const MONAS_LAT = -6.175392;
    const MONAS_LNG = 106.827153;

    it("returns 0 for identical coordinates", () => {
        const dist = haversineDistance(MONAS_LAT, MONAS_LNG, MONAS_LAT, MONAS_LNG);
        expect(dist).toBeCloseTo(0, 5);
    });

    it("calculates correct distance for ~100m apart", () => {
        // ~100m north of Monas
        const lat2 = -6.174492;
        const lng2 = 106.827153;
        const dist = haversineDistance(MONAS_LAT, MONAS_LNG, lat2, lng2);
        // 1 degree lat is ~111km, so 0.0009 degrees is ~100m (0.1 km)
        expect(dist).toBeCloseTo(0.1, 1);
    });

    it("calculates correct distance for ~500m apart", () => {
        // ~500m north of Monas
        const lat2 = -6.170892; // difference is 0.0045 degrees
        const lng2 = 106.827153;
        const dist = haversineDistance(MONAS_LAT, MONAS_LNG, lat2, lng2);
        expect(dist).toBeGreaterThan(0.4);
        expect(dist).toBeLessThan(0.6);
    });

    it("calculates correct distance for ~1km apart", () => {
        // ~1km north of Monas
        const lat2 = -6.166392; // difference is 0.009 degrees
        const lng2 = 106.827153;
        const dist = haversineDistance(MONAS_LAT, MONAS_LNG, lat2, lng2);
        expect(dist).toBeCloseTo(1.0, 1);
    });

    it("calculates correct distance for well-known pair (Jakarta to Bandung ~120km)", () => {
        const jakartaLat = -6.2;
        const jakartaLng = 106.8;
        const bandungLat = -6.9;
        const bandungLng = 107.6;
        const dist = haversineDistance(jakartaLat, jakartaLng, bandungLat, bandungLng);
        // Expect around 120km, within 5km accuracy
        expect(dist).toBeGreaterThan(115);
        expect(dist).toBeLessThan(125);
    });
});
