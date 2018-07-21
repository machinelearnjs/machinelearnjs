/**
 * @ignore
 */
export class BaseDataset {
	/**
	 * List of target names/labels. `.targets` contain a list index of targetNames
	 * @type {any[]}
	 */
	public targetNames: any[] = null;
	/**
	 * List of actual data, X values
	 * @type {any[][]}
	 */
	public data: any[] = null;
	/**
	 * List of targets, y values
	 * @type {any[][]}
	 */
	public targets: any[] = null;
	/**
	 * Description of the dataset
	 * @type {string}
	 */
	public description: string;

}
