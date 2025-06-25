import { describe, it, expect, vi, beforeEach } from 'vitest';
import { locationsService } from '@/services/locationsService';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn(),
      })),
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

describe('Location Logo Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upload logo and return public URL', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const locationId = 'test-location-id';
    const expectedUrl = 'https://example.com/storage/location-logos/test-location-id-123.png';

    // Mock storage upload
    const mockUpload = vi.fn().mockResolvedValue({
      data: { path: `${locationId}-123.png` },
      error: null,
    });

    // Mock getPublicUrl
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: expectedUrl },
    });

    const mockStorageFrom = vi.fn(() => ({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    }));

    (supabase.storage.from as any).mockImplementation(mockStorageFrom);

    const result = await locationsService.uploadLogo(mockFile, locationId);

    expect(mockStorageFrom).toHaveBeenCalledWith('location-logos');
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`^${locationId}-\\d+\\.png$`)),
      mockFile
    );
    expect(mockGetPublicUrl).toHaveBeenCalled();
    expect(result).toBe(expectedUrl);
  });

  it('should update location with logo URL', async () => {
    const locationId = 'test-location-id';
    const logoUrl = 'https://example.com/logo.png';
    const updateData = {
      name: 'Test Location',
      timezone: 'GMT+0',
      logo_url: logoUrl,
    };

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: locationId, ...updateData },
            error: null,
          }),
        }),
      }),
    });

    const mockFrom = vi.fn(() => ({
      update: mockUpdate,
    }));

    (supabase.from as any).mockImplementation(mockFrom);

    const result = await locationsService.update(locationId, updateData);

    expect(mockFrom).toHaveBeenCalledWith('locations');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        ...updateData,
        updated_at: expect.any(String),
      })
    );
    expect(result).toEqual({ id: locationId, ...updateData });
  });

  it('should handle upload errors gracefully', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const locationId = 'test-location-id';

    const mockUpload = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Upload failed' },
    });

    const mockStorageFrom = vi.fn(() => ({
      upload: mockUpload,
    }));

    (supabase.storage.from as any).mockImplementation(mockStorageFrom);

    await expect(locationsService.uploadLogo(mockFile, locationId)).rejects.toThrow();
  });

  it('should delete logo from storage', async () => {
    const logoUrl = 'https://example.com/storage/location-logos/test-file.png';
    
    const mockRemove = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockStorageFrom = vi.fn(() => ({
      remove: mockRemove,
    }));

    (supabase.storage.from as any).mockImplementation(mockStorageFrom);

    await locationsService.deleteLogo(logoUrl);

    expect(mockStorageFrom).toHaveBeenCalledWith('location-logos');
    expect(mockRemove).toHaveBeenCalledWith(['test-file.png']);
  });
});