# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

# Collecting data folders
# Format: (source_path, target_folder_in_exe)
added_files = [
    ('../Model/*', 'Model'),
    ('../Inference Model/*', 'Inference Model'),
    ('../Dataset/tea_combined.csv', 'Dataset'),
    ('../frontend/out/', 'frontend/out'),
    ('../cached_results.json', '.'),
]

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=added_files,
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'statsmodels.tsa.statespace._kalman_filter',
        'statsmodels.tsa.statespace._kalman_smoother',
        'statsmodels.tsa.statespace._representation',
        'statsmodels.tsa.statespace._simulation_smoother',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='TeaProductionIntelligence',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True, # Keep console for uvicorn output
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None # You can add an icon here if available
)
