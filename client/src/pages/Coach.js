import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import '../common/AppHeader.css';
import axios from 'axios';

const coachInfoStyle = {"text-align": "center"};;

class Coach extends Component {

    state = {
        first_name: "",
        last_name: "",
        seasonList: [{
            school: "",
            year: "",
            wins: 0,
            losses: 0,
            preseason_rank: null,
            postseason_rank: null
        }],
        termList: [{
            school: "",
            schoolPrimaryColor: "",
            schoolSecondaryColor: "",
            schoolLogo: "",
            seasonList: [{
                year: "",
                wins: 0,
                losses: 0
            }]
        }]
};

    coachUrlExtractor() {
        let name = window.location.pathname.substr(7);
        return name.split('-');
    }

    allTimeWins() {
        let wins = 0;
        for (let i = 0; i < this.state.seasonList.length; i++) {
            wins += this.state.seasonList[i].wins;
        }
        return wins;
    }

    allTimeLosses() {
        let losses = 0;
        for (let i = 0; i < this.state.seasonList.length; i++) {
            losses += this.state.seasonList[i].losses;
        }
        return losses;
    }

    componentDidMount() {
        // Get coach name from url
        let names = this.coachUrlExtractor();
        axios.all([
            axios.get('https://api.collegefootballdata.com/coaches?firstName=' + names[0] + '&lastName=' + names[1]),
            axios.get('https://api.collegefootballdata.com/teams')
           ])
            .then(res => {
                console.log(res[0].data[0]);
                if (res[0].data[0].length !== 0) {
                    this.setState({
                        first_name: res[0].data[0].first_name,
                        last_name: res[0].data[0].last_name,
                        seasonList: res[0].data[0].seasons
                    });
                }

                let terms = [{
                    school: "",
                    schoolPrimaryColor: "",
                    schoolSecondaryColor: "",
                    schoolLogo: "",
                    seasonList: [{
                        year: "",
                        wins: 0,
                        losses: 0
                    }]
                }];

                let schoolPrimaryColorList = [];
                let schoolSecondaryColorList = [];
                let schoolLogoList = [];
                for (let i = 0; i < this.state.seasonList.length; i++) {
                    for (let j = 0; j < res[1].data.length; j++) {
                        if (res[1].data[j].school === this.state.seasonList[i].school) {
                            schoolPrimaryColorList.push(res[1].data[j].color);
                            schoolSecondaryColorList.push(res[1].data[j].alt_color);
                            schoolLogoList.push(res[1].data[j].logos[0]);
                        }
                    }
                }

                terms[0].school = this.state.seasonList[0].school;
                terms[0].schoolPrimaryColor = schoolPrimaryColorList[0];
                terms[0].schoolSecondaryColor = schoolSecondaryColorList[0];
                terms[0].schoolLogo = schoolLogoList[0];
                terms[0].seasonList[0].year = this.state.seasonList[0].year;
                terms[0].seasonList[0].wins = this.state.seasonList[0].wins;
                terms[0].seasonList[0].losses = this.state.seasonList[0].losses;
                for (let i = 1; i < this.state.seasonList.length; i++) {
                    if (this.state.seasonList[i].school !== terms[terms.length-1].school) {
                        terms.push({
                            school: this.state.seasonList[i].school,
                            schoolPrimaryColor: schoolPrimaryColorList[i],
                            schoolSecondaryColor: schoolSecondaryColorList[i],
                            schoolLogo: schoolLogoList[i],
                            seasonList: [{
                                year: this.state.seasonList[i].year,
                                wins: this.state.seasonList[i].wins,
                                losses: this.state.seasonList[i].losses
                            }]
                        });
                    } else {
                        terms[terms.length - 1].seasonList.push({
                            year: this.state.seasonList[i].year,
                            wins: this.state.seasonList[i].wins,
                            losses: this.state.seasonList[i].losses
                        })
                    }
                    console.log(terms);
                }
                this.setState({
                    termList: terms
                });

            });
    }

    render() {
        if (this.state.first_name.length !== 0) {

            // Name successfully found
            return (
                <div className="container">
                    <div className="Coach_Info" style={coachInfoStyle}>
                        <h1 style={{marginTop: 14, fontSize: 80}}>{this.state.first_name} {this.state.last_name}</h1>
                        <h2>All time record: {this.allTimeWins()}-{this.allTimeLosses()}</h2>
                    </div>
                    <div className="Seasons">
                        <div className="Term_School_Name">
                            {this.state.termList.map(term => (
                                <div>
                                    <Link to={"/school/" + term.school} style={coachInfoStyle}>
                                        <h1 style={{  }}>
                                            <img style={{ marginLeft: 10 }} src={term.schoolLogo} height="100" width="100" alt={term.school}/>
                                            <span style={{ marginLeft: 30, color: term.schoolPrimaryColor}}>
                                                {term.school} ({term.seasonList[0].year}{term.seasonList.length > 1 && "-" + term.seasonList[0].year - term.seasonList.length+1})
                                                {term.seasonList.map(season => (
                                                    <p>
                                                        {season.year}: {season.wins}-{season.losses}
                                                    </p>
                                                ))}
                                            </span>
                                        </h1>
                                    </Link>
                                </div>
                            ))}
                            {/*{this.state.seasonList.map((season) => (*/}
                            {/*    <p>*/}
                            {/*        <Link to={"/school/" + season.school}>{season.school}</Link> ({season.year}): {season.wins}-{season.losses}*/}
                            {/*    </p>*/}
                            {/*))}*/}
                        </div>
                    </div>
                </div>
            )
        } else {

            // Error: name not found
            return (
                <div>
                    <div className="Error_Header">
                        <h1>Coach Not Found</h1>
                    </div>
                </div>
            )
        }
    }
}

export default withRouter(Coach);