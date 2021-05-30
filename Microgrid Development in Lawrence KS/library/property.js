class Property { 
	constructor(row) {
		this.row = row; 
		this.rowIndex = row.rowIndex;
		for (let i=0; i<5; i++) {
		form.elements[i].value = row.childNodes[i].innerHTML; }
		property = this;
		} 

	replace() {
		for (let i=0; i<5; i++) {
			properties[this.rowIndex-1][i] = form.elements[i].value; 
		}
		fillTable(); 
		cancel();
	} 

	deleteProperty() { 
		table.deleteRow(this.rowIndex); 
		properties.splice(this.rowIndex-1,1); 
		cancel();
	} 
}