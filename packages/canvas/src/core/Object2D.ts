/**
 * Base class for 2D canvas objects.
 *
 * @module
 */

/**
 * 2D transformation.
 *
 * @global
 */
export interface Transform2D {
    x: number
    y: number
    rotation: number
    scaleX: number
    scaleY: number
}

/**
 * Base class for objects in 2D canvas scene graph.
 *
 * @global
 */
export class Object2D {
    /** Object position. */
    x = 0
    /** Object position. */
    y = 0
    /** Rotation in radians. */
    rotation = 0
    /** Horizontal scale. */
    scaleX = 1
    /** Vertical scale. */
    scaleY = 1
    /** Visibility flag. */
    visible = true
    /** Parent object. */
    parent: Object2D | null = null
    /** Child objects. */
    children: Object2D[] = []

    /**
     * Add child object.
     *
     * @param child - Child to add.
     */
    add(child: Object2D): void {
        child.parent = this
        this.children.push(child)
    }

    /**
     * Remove child object.
     *
     * @param child - Child to remove.
     */
    remove(child: Object2D): void {
        const index = this.children.indexOf(child)
        if (index !== -1) {
            child.parent = null
            this.children.splice(index, 1)
        }
    }

    /**
     * Get local transform.
     *
     * @returns Transform object.
     */
    getTransform(): Transform2D {
        return {
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
        }
    }

    /**
     * Render this object and its children.
     *
     * @param ctx - Canvas 2D context.
     */
    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return

        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.scale(this.scaleX, this.scaleY)

        this.draw(ctx)

        for (const child of this.children) {
            child.render(ctx)
        }

        ctx.restore()
    }

    /**
     * Draw the object. Override in subclasses.
     *
     * @param _ctx - Canvas 2D context.
     */
    draw(_ctx: CanvasRenderingContext2D): void {
        // Override in subclasses
    }
}
