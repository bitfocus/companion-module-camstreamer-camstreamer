export function setVariables() {
  var variables = [];

  // Set the model and series selected, if in auto, dettect what model is connected via TCP

  // Find the specific commands for a given series

  // console.log(SERIES);

  // console.log('variable set');
  // console.log(self.config.model);
  // console.log(self.data.model);
  // console.log(self.data.modelTCP);
  // console.log(self.data.series);
  
  variables.push({ variableId: "CameraType", name: "Camera Type" });
 

  return variables;
}

// #########################
// #### Check Variables ####
// #########################
export function checkVariables(self) {
  self.setVariableValues({
    series: self.data.series,
    
  });
}
export function getVariableValue(name) {
  let _this = this;
  if (
    Object.prototype.hasOwnProperty.call(_this.variables.changes.values, name)
  ) {
    return _this.variables.changes.values[name];
  }
  let variable = _this.variables.definitions[name];
  if (variable) {
    return variable.value;
  }
}
