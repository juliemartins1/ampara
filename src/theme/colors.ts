export const colors = {
    //cores principais
    primary: '#8810b7',
    primaryDark: '#72268b',
    primaryDeep: '#3d1450', // NOVO: roxo bem escuro, pra fundos de cartão tipo o mockup
    primaryLight: '#8d51a3',
    primarySoft: '#F1E4F5',
    //cor de emergencia
    emergency: '#D64550',
    //neutros
    background: '#FBF8FC',
    surface: '#FFFFFF',
    border: '#e3d3e9',
    textPrimary: '#2e2033',
    textSecondary: '#6e5c76',
    placeholder: '#a796ad',
    //feedback colors
    sucess: '#4c9a6b',
    error: '#c0392b',
    warning: '#d19a2c',

    white: '#FFFFFF',
    black: '#000000',
};
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const radius = {
    sm: 8,
    md: 12,
    lg: 20,
    pill: 999,
};

export const typography = {
    title: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '400' as const,
        color: colors.textSecondary,
    },
    label: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: colors.textPrimary,
    },
    input:{
        fontSize: 16,
        color: colors.textPrimary,
    },
    button: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: colors.white,
    },
    helper:{
        fontSize: 12,
        color: colors.textSecondary,
    },
    errorText:{
        fontSize: 12,
        color: colors.error,
    },
};