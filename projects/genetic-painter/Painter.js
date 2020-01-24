
/**
 * A Painter is a single Painter within a population
 * Which will paint one attempt of the target painting
 */
class Painter {

  constructor (genes) {
    // prepares a canvas specifically for this painter
    this.canvas = invisibleCanvas;
    this.ctx = this.canvas.getContext('2d');

    this.fitness = null;
    // generates the genes, or extends the given genes if necessary
    this.genes = genes || [];
    for(let i = this.genes.length; i < numGenes; i++)
      this.genes.push(new Shape());
  }



  /**
   * This will return the fitness of the Painting, which is determined
   * via the inverse of the RMSE between the canvas and the target painting
   * Does NOT require the painting to be drawn already
   */
  evaluate () {
    // if already has fitness, return that instead
    if(this.fitness != null)
      return 1/this.fitness;
    this.ctx.fillStyle = 'rgba (0,0,0,1)';
    this.ctx.fillRect(0,0,W,H);
    for(var shape of this.genes)
      shape.draw(this.ctx);
    // The painter is exhibiting its artwork
    let myPainting = this.ctx.getImageData(0, 0, W, H).data;
    // The judge will check how bad the painting is
    let succScale = calcError(myPainting);
    if(SHOW_RATINGS)
      console.log("On a scale of 0 to 255, this painting sucks - " + succScale);
    // The painter's chances of making children increases with a small succScale
    this.fitness = 1/succScale;
    return succScale;
  }



  /**
   * The Painter will exhibit its painting at the given
   * canvas
   *
   * @param {Canvas} canvas - An HTML canvas
   */
  exhibit (canvas) {
    let museum = canvas.getContext("2d");
    museum.fillStyle = 'rgba(0,0,0,1)';
    museum.fillRect(0,0,W,H);
    // this.genes[0].draw(museum);
    for(var shape of this.genes)
      shape.draw(museum);
  }



  /**
   * Here this painting will be given a mate, aka another Painter,
   * And together shall make a wonderful painter child, which may be
   * Better or worse at drawing the image. The breeding is done by
   * Randomly swapping genes (crossover) and by either tweaking those
   * Genes slightly, or by completely changing those genetics (mutation)
   * @param {Painter} mate - A different Painter to be bred with
   * @returns {Shape[]} A list of shapes that serve as the genes of the next Painter
   */
  breed (mate) {

    const mateGenes = mate.genes;
    const mineGenes = this.genes;
    const childGenes = new Array(mateGenes.length);

    // crossover the genes
    for(let i = 0, geneLength = mateGenes.length; i < geneLength; i++) {

      const gene = Math.random() < 1/2 ? mateGenes[i].copy() : mineGenes[i].copy();

      // randomly mutates the above gene
      if(Math.random() < mutationRate) {
        tweak(gene);
      }
      childGenes[i] = gene;
    }

    return childGenes;
  }

}
