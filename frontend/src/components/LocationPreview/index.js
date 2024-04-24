import React, { useEffect } from 'react';
import toastError from "../../errors/toastError";

import Typography from "@material-ui/core/Typography";

import { Button, Divider, makeStyles, } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
	container: {
		minWidth: "250px",
	},
	imageContainer: {
		float: "left",
	},
	image: {
		width: "100px",
	},
	descriptionContainer: {
		display: "flex",
		flexWrap: "wrap"
	},
	description: {
		marginTop: "12px",
		marginLeft: "15px",
		marginRight: "15px",
		float: "left"
	},
	divider: {
		display: "block",
		content: "",
		clear: "both"
	}
}));

const LocationPreview = ({ image, link, description }) => {
	const classes = useStyles();
	useEffect(() => { }, [image, link, description]);

	const handleLocation = async () => {
		try {
			window.open(link);
		} catch (err) {
			toastError(err);
		}
	}

	return (
		<>
			<div className={classes.container}>
				<div>
					<div className={classes.imgContainer}>
						<img src={image} alt="" onClick={handleLocation} className={classes.image} />
					</div>
					{description && (
						<div className={classes.descriptionContainer}>
							<Typography
								className={classes.description}
								variant="subtitle1"
								color="primary"
								gutterBottom
							>
								<div dangerouslySetInnerHTML={{ __html: description.replace('\\n', '<br />') }}></div>
							</Typography>
						</div>
					)}
					<div className={classes.divider}></div>
					<div>
						<Divider />
						<Button
							fullWidth
							color="primary"
							onClick={handleLocation}
							disabled={!link}
						>Visualizar</Button>
					</div>
				</div>
			</div>
		</>
	);

};

export default LocationPreview;