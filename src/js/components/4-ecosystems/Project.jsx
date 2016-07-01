import React from 'react';
import Text from '../1-atoms/text';
import moment from 'moment';

const formatDate = date => {
  if (date) {
    return moment(date).format('MMMM Do YYYY');
  }
  return '';
};

const Flow = <p>Placeholder for flow component.</p>;

const Project = ({ project }) => {
  let projectDemand = project.demand;
  let projectDefect = project.defect;
  let projectEffort = project.effort;

  if (!projectDemand) {
    projectDemand = {};
  }

  if (!projectDefect) {
    projectDefect = {};
  }

  if (!projectEffort) {
    projectEffort = {};
  }

  return (
    <div>
      <h1>{project.name}</h1>

      <Text label="ID" content={project.id} />
      <Text label="Name" content={project.name} />
      <Text label="Description" content={project.description} />
      <Text label="Portfolio" content={project.portfolio} />
      <Text label="Program" content={project.program} />
      <Text label="Status" content={project.status} />
      <Text label="Start date" content={formatDate(project.startDate)} />
      <Text label="End date" content={formatDate(project.endDate)} />
      <Text label="Phase" content={project.phase} />

      <div className="subsection">
        <h2>Demand</h2>
        <Text
          label="Source"
          content={projectDemand.source}
        />
        <Text
          label="Source URL"
          content={projectDemand.url}
        />
        <Text
          label="Project"
          content={projectDemand.project}
        />
        <h3>Auth</h3>
        <Text
          label="Auth policy"
          content={projectDemand.authPolicy}
        />
        <Text
          label="Username"
          content={projectDemand.username}
        />
        <Text
          label="Password"
          content="********"
        />
      </div>

      <div className="subsection">
        <h2>Defect</h2>
        <Text
          label="Source"
          content={projectDefect.source}
        />
        <Text
          label="Source URL"
          content={projectDefect.url}
        />
        <Text
          label="Project"
          content={projectDefect.project}
        />
        <h3>Auth</h3>
        <Text
          label="Auth policy"
          content={projectDefect.authPolicy}
        />
        <Text
          label="Username"
          content={projectDefect.username}
        />
        <Text
          label="Password"
          content="********"
        />
      </div>

      <div className="subsection">
        <h2>Effort</h2>
        <Text
          label="Source"
          content={projectEffort.source}
        />
        <Text
          label="Source URL"
          content={projectEffort.url}
        />
        <Text
          label="Project"
          content={projectEffort.project}
        />
        <h3>Auth</h3>
        <Text
          label="Auth policy"
          content={projectEffort.authPolicy}
        />
        <Text
          label="Username"
          content={projectEffort.username}
        />
        <Text
          label="Password"
          content="********"
        />
      </div>

    </div>
  );
};

export default Project;

Project.propTypes = {
  project: React.PropTypes.object.isRequired,
};
