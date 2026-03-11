export interface Fotoclub {
    id?: number;
    name: string;
    description?: string;
    facebook?: string;
    instagram?: string;
    email?: string;
    photo_url?: string;
    photo_base64?: any;
    enabled?: boolean;
    /**
     * Tipo de organización:
     * - INTERNO (Interno)
     * - EXTERNO_0 (Externo)
     * - EXTERNO_UNICEN (UNICEN)
     *
     * Obligatorio en el formulario, por defecto INTERNO.
     */
    organization_type: 'INTERNO' | 'EXTERNO_0' | 'EXTERNO_UNICEN';
    /**
     * Indica si la organización se muestra en el ranking.
     * Por defecto true.
     */
    mostrar_en_ranking?: boolean;
}