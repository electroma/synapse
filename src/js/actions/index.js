import {
  FETCH_PROJECTION_REQUEST,
  SAVE_PROJECTION_REQUEST,
  SET_MESSAGE,
  RESET_PROJECT,
  UPDATE_PROJECTION_ITERATION_LENGTH,
  SET_IS_NEW_PROJECT,
  UPDATE_PROJECT_REQUEST,
  UPDATE_PROJECTION_START_DATE,
  SET_HAS_PROJECTION,
} from './actions';
import config from 'config';
import $ from 'jquery';
import { browserHistory } from 'react-router';
const trimFormInputs = require('../helpers/trimFormInputs');
const isValid = require('../helpers/isValid');

const apiBaseUrl = config.get('Client.api.baseUrl');
const starterProjectsBaseApiUrl = config.get('Client.starterProjectsApi.baseUrl');
const errorHelper = require('../helpers/errorHelper');

const requestProjects = () => (
  { type: 'FETCH_PROJECTS_REQUEST' }
);

const receiveProjects = (response) => (
  {
    type: 'FETCH_PROJECTS_RECEIVE',
    response,
  }
);

const receiveStarterProjects = (response) => (
  {
    type: 'FETCH_STARTER_PROJECTS_RECEIVE',
    response,
  }
);

const setErrorMessage = (message) => (
  {
    type: 'SET_ERROR_MESSAGE',
    message,
  }
);

export const onSwitchView = view => {
  /* eslint-disable no-console */
  console.log('onSwitchView has been deprecated. Please use switchLocation instead.');
  /* eslint-enable no-console */
  return ({
    type: 'SWITCH_VIEW',
    view,
  });
};

export const switchLocation = location => {
  // This probably isn't the right way to do this.
  browserHistory.push(location);
};

export const showModal = (modal, project) => ({
  type: 'SHOW_MODAL', modal, project,
});

export const hideModal = (modal) => ({
  type: 'HIDE_MODAL', modal,
});

export const fetchProjects = () => (dispatch) => {
  dispatch(requestProjects());
  return $.get(`${apiBaseUrl}v1/project/`)
    .done(response => {
      dispatch(receiveProjects(response));
    })
    .fail(() => {
      dispatch(setErrorMessage('We could not fetch the projects.'));
      dispatch(onSwitchView('error'));
    });
};

export const fetchStarterProjects = () => (dispatch) => {
  dispatch({
    type: 'FETCH_STARTER_PROJECTS_REQUEST',
  });

  return $.get(`${starterProjectsBaseApiUrl}v1/project?status=available`)
    .done(response => {
      dispatch(receiveStarterProjects(response));
    })
    .fail(response => {
      dispatch(setErrorMessage(response.responseText));
      dispatch(switchLocation('error'));
    });
};

export const fetchProject = (name) => (dispatch) => {
  dispatch({
    type: 'FETCH_PROJECT_REQUEST',
  });
  return $.get(`${apiBaseUrl}v1/project/${name}`)
    .done(
      data => {
        const project = data;
        if (project) {
          dispatch({
            type: 'FETCH_PROJECT_SUCCESS',
            project,
          });
          dispatch({
            type: 'SWITCH_VIEW',
            view: 'projectView',
          });
        } else {
          dispatch(setErrorMessage('We could not fetch the project.'));
          dispatch(switchLocation('error'));
        }
      })
      .fail(() => {
        dispatch(setErrorMessage('We could not fetch the project.'));
        dispatch(switchLocation('error'));
      });
};

export const fetchStatus = (name) => (dispatch) => {
  const demandCall = $.get(`${apiBaseUrl}v1/project/${name}/demand/summary`);
  const defectCall = $.get(`${apiBaseUrl}v1/project/${name}/defect/summary`);
  const effortCall = $.get(`${apiBaseUrl}v1/project/${name}/effort/summary`);

  // These endpoints provide simplified status data, which is helpful for testing.
  // const demandCall = $.get('https://tonicdev.io/billyzac/57befb878bec6b13001152a9/branches/master/demand');
  // const defectCall = $.get('https://tonicdev.io/billyzac/57befb878bec6b13001152a9/branches/master/defect');
  // const effortCall = $.get('https://tonicdev.io/billyzac/57befb878bec6b13001152a9/branches/master/effort');

  const fetchFailureMessage = `It seems that the data service is unresponsive.
    Please check the data service and make sure it's up and running.`;

  dispatch({ type: 'FETCH_STATUS_REQUEST' });

  $.when(demandCall)
  .done(statusData => {
    if (isValid(statusData, 'demand-status-data')) {
      dispatch({
        type: 'FETCH_STATUS_SUCCESS',
        statusData,
      });
    } else {
      // Don't know why this is not being set.
      dispatch(setErrorMessage('The demand data received from the API was improperly formatted.'));

      // But this works -- it does go to the error route. Hm.
      dispatch(switchLocation('/error'));
    }
  })
  .fail(() => {
    dispatch(setErrorMessage(fetchFailureMessage));
    dispatch(switchLocation('/error'));
  });
  $.when(defectCall)
  .done(statusData => {
    if (isValid(statusData, 'defect-status-data')) {
      dispatch({
        type: 'FETCH_DEFECT_SUCCESS',
        statusData,
      });
    } else {
      dispatch(setErrorMessage('The defect data received from the API was improperly formatted.'));
      dispatch(switchLocation('/error'));
    }
  })
  .fail(() => {
    dispatch(setErrorMessage(fetchFailureMessage));
    dispatch(switchLocation('/error'));
  });
  $.when(effortCall)
  .done(statusData => {
    if (isValid(statusData, 'effort-status-data')) {
      dispatch({
        type: 'FETCH_EFFORT_SUCCESS',
        statusData,
      });
    } else {
      dispatch(setErrorMessage('The effort data received from the API was improperly formatted.'));
      dispatch(switchLocation('/error'));
    }
  })
  .fail(() => {
    dispatch(setErrorMessage(fetchFailureMessage));
    dispatch(switchLocation('/error'));
  });
};
export const saveFormData = (project) => (dispatch) => {
  dispatch({
    type: SET_MESSAGE,
    message: `Saving ${project.name}...`,
  });

  const trimmedProject = trimFormInputs(project);

  return (
    $.ajax({
      type: 'POST',
      url: `${apiBaseUrl}v1/project/${project.name}`,
      data: JSON.stringify(trimmedProject),
      contentType: 'application/json',
    })
    .done(() => {
      dispatch(onSwitchView('modalView'));
      dispatch(showModal('SaveConfirmationModal', project));
      dispatch({
        type: SET_MESSAGE,
        message: '',
      });
    })
    .fail(response => {
      dispatch(setErrorMessage(errorHelper(response)));
      dispatch(switchLocation('/error'));
    })
  );
};

export const initializeNewProject = (harvestId) => ({
  type: 'INITIALIZE_NEW_PROJECT',
  harvestId,
});

export const onInputChange = (section, key, value) => ({
  type: 'UPDATE_FORM_DATA',
  section,
  key,
  value,
});

export const initializeFormData = (project) => ({
  type: 'INITIALIZE_FORM_DATA',
  project,
});

export const onListItemRemove = (section, list, index) => ({
  type: 'REMOVE_LIST_ITEM',
  section,
  list,
  index,
});

export const addItemToDemandFlowList = (name) => ({
  type: 'ADD_DEMAND_FLOW_LIST_ITEM',
  name,
});

export const addItemToDefectFlowList = (name) => ({
  type: 'ADD_DEFECT_FLOW_LIST_ITEM',
  name,
});

export const addItemToRoleList = (name, groupWith) => ({
  type: 'ADD_ROLE_LIST_ITEM',
  name,
  groupWith,
});

export const addItemToSeverityList = (name, groupWith) => ({
  type: 'ADD_SEVERITY_LIST_ITEM',
  name,
  groupWith,
});

export const moveListItemUp = (section, list, index) => ({
  type: 'MOVE_LIST_ITEM_UP',
  section,
  list,
  index,
});

export const moveListItemDown = (section, list, index) => ({
  type: 'MOVE_LIST_ITEM_DOWN',
  section,
  list,
  index,
});

export const updateProjectionVelocityStart = value => ({
  type: 'UPDATE_PROJECTION_VELOCITY_START',
  value,
});

export const updateProjectionVelocityMiddle = value => ({
  type: 'UPDATE_PROJECTION_VELOCITY_MIDDLE',
  value,
});

export const updateProjectionVelocityEnd = value => ({
  type: 'UPDATE_PROJECTION_VELOCITY_END',
  value,
});

export const updateProjectionPeriodStart = value => ({
  type: 'UPDATE_PROJECTION_PERIOD_START',
  value,
});

export const updateProjectionPeriodEnd = value => ({
  type: 'UPDATE_PROJECTION_PERIOD_END',
  value,
});

export const updateProjectionBacklogSize = value => ({
  type: 'UPDATE_PROJECTION_BACKLOG_SIZE',
  value,
});

export const updateProjectionDarkMatter = value => ({
  type: 'UPDATE_PROJECTION_DARK_MATTER',
  value,
});

export const updateProjectionIterationLength = value => ({
  type: UPDATE_PROJECTION_ITERATION_LENGTH,
  value,
});

export const updateProjectionStartDate = value => ({
  type: UPDATE_PROJECTION_START_DATE,
  value,
});

export const fetchProjection = (name) => (dispatch) => {
  dispatch({
    type: FETCH_PROJECTION_REQUEST,
  });

  return $.get(`${apiBaseUrl}v1/project/${name}`)
    .done(
      project => {
        dispatch({
          type: 'UPDATE_PROJECTION_BACKLOG_SIZE',
          value: project.projection.backlogSize,
        });
        dispatch({
          type: 'UPDATE_PROJECTION_VELOCITY_START',
          value: project.projection.startVelocity,
        });

        dispatch({
          type: 'UPDATE_PROJECTION_VELOCITY_MIDDLE',
          value: project.projection.targetVelocity,
        });

        dispatch({
          type: 'UPDATE_PROJECTION_VELOCITY_END',
          value: project.projection.endVelocity,
        });

        dispatch({
          type: 'UPDATE_PROJECTION_PERIOD_START',
          value: project.projection.startIterations,
        });

        dispatch({
          type: 'UPDATE_PROJECTION_PERIOD_END',
          value: project.projection.endIterations,
        });

        dispatch({
          type: 'UPDATE_PROJECTION_DARK_MATTER',
          value: project.projection.darkMatterPercentage,
        });

        dispatch({
          type: 'UPDATE_PROJECTION_ITERATION_LENGTH',
          value: project.projection.iterationLength,
        });

        dispatch({
          type: UPDATE_PROJECTION_START_DATE,
          value: project.projection.startDate,
        });

        dispatch({
          type: SET_HAS_PROJECTION,
          value: true,
        });
      })
      .fail(() => {
        dispatch({
          type: SET_MESSAGE,
          message: `You're creating a new projection for project ${name}.`,
        });

        dispatch({
          type: SET_HAS_PROJECTION,
          value: false,
        });
      });
};

export const saveProjection = (projection, name) => dispatch => {
  const projectionToSave = {
    backlogSize: projection.backlogSize,
    darkMatterPercentage: projection.darkMatter,
    iterationLength: projection.iterationLength,
    startVelocity: projection.velocityStart,
    targetVelocity: projection.velocityMiddle,
    startIterations: projection.periodStart,
    endIterations: projection.periodEnd,
    endVelocity: projection.velocityEnd,
    startDate: projection.startDate,
  };
  dispatch({
    type: SAVE_PROJECTION_REQUEST,
  });

  return $.ajax({
    type: 'PUT',
    url: `${apiBaseUrl}v1/project/${name}/projection`,
    data: JSON.stringify(projectionToSave),
    contentType: 'application/json',
    // dataType: 'json',
  })
  .done(() => {
    dispatch({
      type: SET_MESSAGE,
      message: `The projection for project ${name} was saved successfully.`,
    });
  })
  .fail(response => {
    dispatch({
      type: SET_MESSAGE,
      message: 'There was an error. We could not save the projection.',
    });
  });
};

export const updateProject = project => dispatch => {
  dispatch({
    type: UPDATE_PROJECT_REQUEST,
  });

  return $.ajax({
    type: 'PUT',
    url: `${apiBaseUrl}v1/project/${project.name}`,
    data: JSON.stringify(project),
    contentType: 'application/json',
    dataType: 'json',
  })
  .done(() => {
    dispatch({
      type: SET_MESSAGE,
      message: `The form data for project ${name} was saved successfully.`,
    });
  })
  .fail(response => {
    dispatch({
      type: SET_MESSAGE,
      message: 'There was an error. We could not save the project.',
    });
  });
};

export const dismissMessage = () => (
  {
    type: SET_MESSAGE,
    message: '',
  }
);

export const resetProject = () => ({ type: RESET_PROJECT });

export const setIsNewProject = value => (
  {
    type: SET_IS_NEW_PROJECT,
    value,
  }
);
