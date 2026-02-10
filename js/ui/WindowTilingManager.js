export class WindowTilingManager {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.tiledWindows = []; // Ventanas actualmente en mosaico
        this.tileHint = null;   // cache del elemento (1 sola instancia)
        this.draggedWindow = null; // Ventana que se está arrastrando
    }

    setDraggedWindow(windowInstance) {
        this.draggedWindow = windowInstance;
    }

    unsetDraggedWindow() {
        this.draggedWindow = null;
    }

    _onHoverLayoutOption(hoveredElement) {
        try {
            const layoutOption = hoveredElement.currentTarget;
            layoutOption.style.outline = '2px solid rgba(78, 78, 78, 0.7)';
        } catch (error) {
            console.error('Error showing layout preview:', error);
            alert('An error occurred while showing the layout preview. Please try again.');
        }
    }

    _onReleaseLayoutOption(hoveredElement) {
        try {
            if (!hoveredElement || !hoveredElement.currentTarget) return;

            const layoutOption = hoveredElement.currentTarget;
            layoutOption.style.outline = '1px solid rgba(78, 78, 78, 0.35)';
            const windowTileReleasedOn = document.elementFromPoint(hoveredElement.clientX, hoveredElement.clientY);

            this.hideFullLayoutPreview(layoutOption);
            this.setWindowTilingLayout(windowTileReleasedOn, topLeftRelativeOptionPositionX, topLeftRelativeOptionPositionY, this.windowManager);
        } catch (error) {
            alert('An error occurred while applying the selected layout. Please try again. ' + error);
            console.error('Error applying layout:', error);
        }
    }

    _onLeaveLayoutOption(hoveredElement) {
        const layoutOption = hoveredElement.currentTarget;
        layoutOption.style.outline = '1px solid rgba(78, 78, 78, 0.35)';
        this.hideFullLayoutPreview(layoutOption);
    }

    hideFullLayoutPreview(layoutOption) {
        const preview = layoutOption.querySelector('.full-layout-preview');
        if (preview) {
            preview.style.display = 'none';
        }
    }

    createLayoutContainer(className) {
        const layout = document.createElement('div');
        layout.className = `layout-container ${className}`;
        layout.style.cssText = [
            'width:150px',
            'height:84.37px',
            'display:flex',
            'border-radius:8px',
            'overflow:hidden',
            'background:rgba(78, 78, 78, 0.15)',
            'outline:1px solid rgba(78, 78, 78, 0.35)'
        ].join(';');
        return layout;
    }

    addHoverEvents(elements) {
        try {
            const normalizedElements = Array.isArray(elements) ? elements : [elements];
            for (let i = 0; i < normalizedElements.length; i++) {
                const element = normalizedElements[i];
                if (!element || typeof element.addEventListener !== 'function') continue;

                element.addEventListener('mouseenter', (event) => this._onHoverLayoutOption(event));
                element.addEventListener('mouseup', (event) => this._onReleaseLayoutOption(event));
                element.addEventListener('mouseleave', (event) => this._onLeaveLayoutOption(event));
            }
        } catch (error) {
            alert('An error occurred while adding hover events to layout options. Please try again. ' + error);
            console.error('Error adding hover events:', error);
        }

    }

    createTwoEqualColumnsVerticalLayout() {
        const layout = this.createLayoutContainer('layout-two-columns');

        const left = document.createElement('div');
        left.id = 'left-column';
        left.className = 'left-column';
        left.style.cssText = [
            'width:50%',
            'height:100%',
            'background:rgba(78, 78, 78, 0.6)'
        ].join(';');

        const right = document.createElement('div');
        right.id = 'right-column';
        right.className = 'right-column';
        right.style.cssText = [
            'width:50%',
            'height:100%',
            'background:rgba(78, 78, 78, 0.35)'
        ].join(';');

        layout.appendChild(left);
        layout.appendChild(right);

        this.addHoverEvents(layout);

        return layout;
    }

    createThreeEqualColumnsVerticalLayout() {
        const layout = this.createLayoutContainer('layout-three-equal-columns');

        const left = document.createElement('div');
        left.className = 'left-column';
        left.style.cssText = [
            'width:33.33%',
            'height:100%',
            'background:rgba(78, 78, 78, 0.6)'
        ].join(';');

        const central = document.createElement('div');
        central.className = 'central-column';
        central.style.cssText = [
            'width:33.34%',
            'height:100%',
            'background:rgba(78, 78, 78, 0.6)'
        ].join(';');

        const right = document.createElement('div');
        right.className = 'right-column';
        right.style.cssText = [
            'width:33.33%',
            'height:100%',
            'background:rgba(78, 78, 78, 0.35)'
        ].join(';');

        layout.appendChild(left);
        layout.appendChild(central);
        layout.appendChild(right);

        this.addHoverEvents(layout);

        return layout;
    }

    suggestTiling() {
        if (!this.tileHint) {
            const tileHint = document.createElement('div');
            tileHint.id = 'tile-hint';

            tileHint.style.cssText = [
                'position:fixed',
                'top:0',
                'left:25%',
                'width:50%', // TODO cambiar para que sea dinamico dependiendo de los layouts que tenga con un maximo de screen.width - 10 tal vez para dejar un margen limpio a los bordes
                'height:15%',
                'z-index:9999',
                'pointer-events:none',
                'transition:opacity 0.2s ease-in-out, visibility 0.2s ease-in-out',
                'border-radius:0 0 15px 15px',
                'background-color:rgba(225, 225, 225, 0.5)',
                'opacity:0',
                'visibility:hidden'
            ].join(';');

            document.body.appendChild(tileHint);

            // crear los distintos layouts
            this.addLayoutOptions(tileHint);

            this.tileHint = tileHint;
        }

        this.tileHint.style.visibility = 'visible';
        this.tileHint.style.opacity = '1';
        return this.tileHint;
    }

    addLayoutOptions(tileHint) {
        tileHint.textContent = '';

        const options = document.createElement('div');
        options.className = 'tile-layout-options';
        options.style.cssText = [
            'display:flex',
            'gap: 10px',
            'height:100%',
            'align-items:center',
            'justify-content:center',
            'pointer-events:auto'
        ].join(';');

        options.appendChild(this.createTwoEqualColumnsVerticalLayout());
        options.appendChild(this.createThreeEqualColumnsVerticalLayout());

        tileHint.appendChild(options);
    }

    removeSuggestedTiling() {
        if (!this.tileHint) return;

        this.tileHint.style.opacity = '0';
        this.tileHint.style.visibility = 'hidden';
    }

    setWindowTilingLayout(layoutOption, topLeftRelativeOptionPositionX, topLeftRelativeOptionPositionY, windowManager) {
        try {
            if (!layoutOption || !layoutOption.classList) return;

            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            alert(
                'Setting tiling layout:\n' +
                'Screen Width: ' + screenWidth + '\n' +
                'Screen Height: ' + screenHeight + '\n' +
                'Selected Layout style: ' + layoutOption.style.cssText + '\n',
                'Selected Layout Classes: ' + Array.from(layoutOption.classList).join(', '),
                'Top-Left Relative Option Position X: ' + topLeftRelativeOptionPositionX + '\n' +
                'Top-Left Relative Option Position Y: ' + topLeftRelativeOptionPositionY
            );

            if (layoutOption.parent.classList.contains('layout-two-columns') && windows.length >= 2) {
                const tileableWindow = windowManager.windowInstances.filter(win => win.isTileable()).slice(0, 2);
                if (tileableWindow.length < 2) {
                    alert('Not enough tileable windows available for this layout.');
                    return;
                }

                alert('Windows to be tiled:', tileableWindow);
            }
        } catch (error) {
            console.error('Error setting tiling layout:', error);
        }
    }

    isTiled(windowInstance) {
        return this.tiledWindows.includes(windowInstance);
    }
}