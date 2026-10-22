export type CompressedPhotosStatus = 'processing' | 'running' | 'done' | 'error';

export interface CompressedPhotos {
    download_url?: string;
    job_id?: string;
    status?: CompressedPhotosStatus;
    cached?: boolean;
    is_judged?: boolean;
    message?: string;
}

export interface CompressedPhotosProgress {
    success: boolean;
    job_id: string;
    contest_id: number;
    status: 'running' | 'done' | 'error';
    phase: 'preparing' | 'copying' | 'compressing' | 'done' | 'error';
    percent: number;
    processed: number;
    total: number;
    message: string;
    download_url: string | null;
    error: string | null;
}
