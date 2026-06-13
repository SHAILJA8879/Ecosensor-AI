import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BillScanner from '../components/BillScanner';

// Mock window.URL methods which are not supported in jsdom
beforeAll(() => {
  window.URL.createObjectURL = jest.fn(() => 'blob:mock-preview-url');
  window.URL.revokeObjectURL = jest.fn();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('BillScanner Component', () => {
  let onScanSuccessMock;

  beforeEach(() => {
    onScanSuccessMock = jest.fn();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 1. Initial State Render
  test('renders initial upload zone correctly', () => {
    render(<BillScanner onScanSuccess={onScanSuccessMock} />);
    
    expect(screen.getByRole('button', { name: /drag and drop your bill image here/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /scan bill/i })).not.toBeInTheDocument();
  });

  // 2. File Type Validation
  test('rejects file uploads with unsupported mimetypes', async () => {
    render(<BillScanner onScanSuccess={onScanSuccessMock} />);
    
    const invalidFile = new File(['dummy content'], 'document.txt', { type: 'text/plain' });
    const dropzone = screen.getByRole('button', { name: /drag and drop your bill image here/i });

    // Simulate file drop
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [invalidFile] }
    });

    await waitFor(() => {
      expect(screen.getAllByText(/invalid file format/i)[0]).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /scan bill/i })).not.toBeInTheDocument();
  });

  // 3. File Size Validation
  test('rejects file uploads exceeding the 5MB size limit', async () => {
    render(<BillScanner onScanSuccess={onScanSuccessMock} />);
    
    // 6MB file
    const oversizedFile = {
      name: 'large-bill.png',
      size: 6 * 1024 * 1024,
      type: 'image/png'
    };
    
    const dropzone = screen.getByRole('button', { name: /drag and drop your bill image here/i });

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [oversizedFile] }
    });

    await waitFor(() => {
      expect(screen.getAllByText(/file is too large/i)[0]).toBeInTheDocument();
    });
  });

  // 4. Successful Upload and Reset Operations
  test('accepts valid images, displays preview, and handles resets correctly', async () => {
    render(<BillScanner onScanSuccess={onScanSuccessMock} />);
    
    const validFile = new File(['image-bytes'], 'electricity.png', { type: 'image/png' });
    const dropzone = screen.getByRole('button', { name: /drag and drop your bill image here/i });

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [validFile] }
    });

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /uploaded bill scan preview/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /scan the uploaded bill image/i })).toBeInTheDocument();
    });

    // Clear uploaded file
    const clearBtn = screen.getByRole('button', { name: /clear selected file/i });
    await userEvent.click(clearBtn);

    expect(screen.queryByRole('img', { name: /uploaded bill scan preview/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /drag and drop your bill image here/i })).toBeInTheDocument();
  });

  // 5. Successful Scan Execution
  test('handles successful bill scans and calls parent callback', async () => {
    const mockScanData = {
      kwh: 350,
      fuel_liters: null,
      billing_date: '2026-05-15'
    };

    // Mock fetch resolution
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockScanData, message: 'Success' })
    });

    render(<BillScanner onScanSuccess={onScanSuccessMock} />);
    
    const validFile = new File(['image-bytes'], 'electricity.png', { type: 'image/png' });
    const dropzone = screen.getByRole('button', { name: /drag and drop your bill image here/i });

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [validFile] }
    });

    const scanBtn = await screen.findByRole('button', { name: /scan the uploaded bill image/i });
    await userEvent.click(scanBtn);

    await waitFor(() => {
      expect(onScanSuccessMock).toHaveBeenCalledWith(mockScanData);
    });
  });

  // 6. Handle Server/API Failures
  test('handles scan API failures and reports user-friendly warnings', async () => {
    // Mock server 429 Rate Limit error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ success: false, data: null, message: 'Too many requests' })
    });

    render(<BillScanner onScanSuccess={onScanSuccessMock} />);
    
    const validFile = new File(['image-bytes'], 'electricity.png', { type: 'image/png' });
    const dropzone = screen.getByRole('button', { name: /drag and drop your bill image here/i });

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [validFile] }
    });

    const scanBtn = await screen.findByRole('button', { name: /scan the uploaded bill image/i });
    await userEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/server is currently busy scanning bills/i)[0]).toBeInTheDocument();
      expect(onScanSuccessMock).not.toHaveBeenCalled();
    });
  });
});
