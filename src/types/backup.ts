export interface BackupTableInfo {
    name: string;
    displayName: string;
    count: number;
    size: number;
}

export interface BackupMetadata {
    id: string;
    createdAt: string;
    createdBy: string;
    createdByName: string;
    version: string;
    totalSize: number;
    dbFileSize: number;
    tables: BackupTableInfo[];
    totalRecords: number;
}

export interface BackupListItem {
    id: string;
    createdAt: string;
    createdBy: string;
    createdByName: string;
    totalSize: number;
    dbFileSize: number;
    totalRecords: number;
    tableCount: number;
    tables: BackupTableInfo[];
}

export interface BackupCreateResponse {
    success: boolean;
    backup: BackupMetadata;
    message: string;
}

export interface BackupRestoreResponse {
    success: boolean;
    message: string;
    restoredTables: number;
    restoredRecords: number;
}

export interface BackupDeleteResponse {
    success: boolean;
    message: string;
}
