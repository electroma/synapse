const blankProject = {
  name: '',
  demand: {
    flow: [],
  },
  defect: {
    flow: [],
    severity: [],
  },
  effort: {
    role: [],
  },
  new: true,
};

class BlankProjectGenerator {
  create() {
    return Object.assign({}, blankProject);
  }
}
const generator = new BlankProjectGenerator();

export default generator;
